import { createContext, Dispatch } from 'react';

import { stateSet } from '../../../actions';
import { nullDispatch } from '../../../context/state';
import { ActionTypeKeyPressed, Keys } from '../../../hooks/vim';
import { scrollThroughItems } from '../../../utils/delta';
import {
  ArtistAlbumsLoaded,
  ArtistSongsLoaded,
  ArtistsSet,
  CmusUIAction,
  CmusUIActionType,
} from './actions';
import { CmusUIState, LibraryModeWindow, View } from './types';

export const initialCmusUIState: CmusUIState = {
  globalAction: null,
  globalActionSerialNumber: 0,
  view: View.Library,
  artists: [],
  artistAlbums: {},
  artistSongs: {},
  library: {
    modeWindow: LibraryModeWindow.ArtistList,
    expandedArtists: [],
    activeArtist: null,
    activeAlbum: null,
    activeSongId: null,
    visibleSongs: [],
  },
};

export const CmusUIStateContext = createContext<CmusUIState>(initialCmusUIState);
export const CmusUIDispatchContext = createContext<Dispatch<CmusUIAction>>(nullDispatch);

const libraryModeWindows: LibraryModeWindow[] = Object.values(LibraryModeWindow);

const switchLibraryMode = (state: CmusUIState): CmusUIState => ({
  ...state,
  library: {
    ...state.library,
    modeWindow:
      libraryModeWindows[
        (libraryModeWindows.indexOf(state.library.modeWindow) + 1) % libraryModeWindows.length
      ],
  },
});

const setActiveSongIdFromActiveArtist = (state: CmusUIState): CmusUIState => ({
  ...state,
  library: {
    ...state.library,
    activeSongId: state.library.activeArtist
      ? state.artistSongs[state.library.activeArtist]?.[0]?.id ?? null
      : null,
  },
});

const scrollArtists = (state: CmusUIState, delta: number): CmusUIState =>
  setActiveSongIdFromActiveArtist({
    ...state,
    library: {
      ...state.library,
      activeArtist: scrollThroughItems(
        state.artists,
        (compare) => compare === state.library.activeArtist,
        delta,
      ),
    },
  });

const scrollSongs = (state: CmusUIState, delta: number): CmusUIState =>
  state.library.activeArtist
    ? {
        ...state,
        library: {
          ...state.library,
          activeSongId: scrollThroughItems(
            state.artistSongs[state.library.activeArtist] ?? [],
            (compare) => compare.id === state.library.activeSongId,
            delta,
          ).id,
        },
      }
    : state;

function toggleExpandArtist(library: CmusUIState['library']): CmusUIState['library'] {
  if (!library.activeArtist) {
    return library;
  }
  if (library.expandedArtists.includes(library.activeArtist)) {
    return {
      ...library,
      expandedArtists: library.expandedArtists.filter(
        (compare) => compare !== library.activeArtist,
      ),
    };
  }
  return { ...library, expandedArtists: [...library.expandedArtists, library.activeArtist] };
}

function handleScrollDown(state: CmusUIState): CmusUIState {
  if (state.view === View.Library) {
    if (state.library.modeWindow === LibraryModeWindow.ArtistList) {
      return scrollArtists(state, 1);
    }
    if (state.library.modeWindow === LibraryModeWindow.SongList) {
      return scrollSongs(state, 1);
    }
  }

  return state;
}

function handleScrollUp(state: CmusUIState): CmusUIState {
  if (state.view === View.Library) {
    if (state.library.modeWindow === LibraryModeWindow.ArtistList) {
      return scrollArtists(state, -1);
    }
    if (state.library.modeWindow === LibraryModeWindow.SongList) {
      return scrollSongs(state, -1);
    }
  }

  return state;
}

function handleKeyPress(state: CmusUIState, key: string): CmusUIState {
  switch (key) {
    case Keys['1']:
      return { ...state, view: View.Library };
    case Keys.tab:
      if (state.view === View.Library) {
        return switchLibraryMode(state);
      }
      return state;

    case Keys.space:
      if (state.view === View.Library) {
        if (state.library.modeWindow === LibraryModeWindow.ArtistList) {
          return { ...state, library: toggleExpandArtist(state.library) };
        }
      }
      return state;

    case Keys.enter:
      if (state.view === View.Library) {
        if (state.library.modeWindow === LibraryModeWindow.SongList) {
          if (!state.library.activeSongId) {
            return state;
          }

          return {
            ...state,
            globalAction: stateSet({
              playing: true,
              songId: state.library.activeSongId,
              currentTime: 0,
              seekTime: 0,
            }),
            globalActionSerialNumber: state.globalActionSerialNumber + 1,
          };
        }
      }

      return state;

    case Keys.J:
      return handleScrollDown(state);
    case Keys.K:
      return handleScrollUp(state);

    default:
      return state;
  }
}

const setArtists = (state: CmusUIState, action: ArtistsSet): CmusUIState => ({
  ...state,
  artists: action.payload,
  library: { ...state.library, activeArtist: action.payload[0] ?? null },
});

const setArtistAlbums = (state: CmusUIState, action: ArtistAlbumsLoaded): CmusUIState => ({
  ...state,
  artistAlbums: { ...state.artistAlbums, [action.payload.artist]: action.payload.albums },
});

const setArtistSongs = (state: CmusUIState, action: ArtistSongsLoaded): CmusUIState => ({
  ...state,
  artistSongs: { ...state.artistSongs, [action.payload.artist]: action.payload.songs },
  library: {
    ...state.library,
    activeSongId:
      state.library.activeArtist === action.payload.artist
        ? action.payload.songs[0]?.id ?? null
        : state.library.activeSongId,
  },
});

export function cmusUIReducer(state: CmusUIState, action: CmusUIAction): CmusUIState {
  switch (action.type) {
    case ActionTypeKeyPressed:
      return handleKeyPress(state, action.key);

    case CmusUIActionType.ArtistsSet:
      return setArtists(state, action);
    case CmusUIActionType.ArtistAlbumsLoaded:
      return setArtistAlbums(state, action);
    case CmusUIActionType.ArtistSongsLoaded:
      return setArtistSongs(state, action);

    case CmusUIActionType.LibraryModeSet:
      return { ...state, library: { ...state.library, modeWindow: action.payload } };

    default:
      return state;
  }
}
