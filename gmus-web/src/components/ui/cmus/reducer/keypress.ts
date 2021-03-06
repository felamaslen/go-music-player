import {
  activeClientToggled,
  masterSet,
  playPaused,
  queuePushed,
  queueRemoved,
  stateSet,
} from '../../../../actions';
import { ActionKeyPressed, Keys } from '../../../../hooks/vim';
import { getFilteredSongs } from '../selectors';
import { CmusUIState, LibraryModeWindow, Overlay, View } from '../types';
import { handleOrder } from './order';
import { handleScroll } from './scroll';
import { withGlobalAction } from './utils';

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

function toggleExpandArtist(library: CmusUIState['library']): CmusUIState['library'] {
  if (library.activeArtist === null) {
    return library;
  }
  if (library.expandedArtists.includes(library.activeArtist)) {
    return {
      ...library,
      expandedArtists: library.expandedArtists.filter(
        (compare) => compare !== library.activeArtist,
      ),
      activeAlbum: null,
    };
  }
  return { ...library, expandedArtists: [...library.expandedArtists, library.activeArtist] };
}

const activateSong = (state: CmusUIState, songId: number | null): CmusUIState =>
  songId
    ? withGlobalAction(
        state,
        stateSet({
          playing: true,
          songId,
          currentTime: 0,
          seekTime: 0,
        }),
      )
    : state;

function handleActivate(state: CmusUIState): CmusUIState {
  switch (state.view) {
    case View.Library:
      switch (state.library.modeWindow) {
        case LibraryModeWindow.SongList:
          return activateSong(state, state.library.activeSongId);
        case LibraryModeWindow.ArtistList:
          return activateSong(state, getFilteredSongs(state)[0]?.id ?? null);
        default:
          return state;
      }

    case View.Queue:
      if (!state.queue.active) {
        return state;
      }
      return activateSong(state, state.queue.active);

    case View.ClientList:
      if (!state.clientList.active) {
        return state;
      }
      return withGlobalAction(state, masterSet(state.clientList.active));

    default:
      return state;
  }
}

function handleToggle(state: CmusUIState): CmusUIState {
  switch (state.view) {
    case View.Library:
      if (state.library.modeWindow === LibraryModeWindow.ArtistList) {
        return { ...state, library: toggleExpandArtist(state.library) };
      }
      return state;

    case View.ClientList:
      if (!state.clientList.active) {
        return state;
      }
      return withGlobalAction(state, activeClientToggled(state.clientList.active));

    default:
      return state;
  }
}

function addSelectedToQueue(state: CmusUIState): CmusUIState {
  if (state.view !== View.Library) {
    return state;
  }
  switch (state.library.modeWindow) {
    case LibraryModeWindow.ArtistList:
      return withGlobalAction(state, queuePushed(getFilteredSongs(state).map(({ id }) => id)));
    case LibraryModeWindow.SongList:
      if (!state.library.activeSongId) {
        return state;
      }
      return withGlobalAction(state, queuePushed([state.library.activeSongId]));
    default:
      return state;
  }
}

export function handleKeyPress(state: CmusUIState, action: ActionKeyPressed): CmusUIState {
  switch (action.key) {
    case Keys.colon:
      return { ...state, commandMode: true };

    case Keys['1']:
      return { ...state, view: View.Library };
    case Keys['2']:
      return { ...state, view: View.ClientList };
    case Keys['3']:
      return { ...state, view: View.Queue };

    case Keys.tab:
      if (state.view === View.Library) {
        return switchLibraryMode(state);
      }
      return state;

    case Keys.space:
      return handleToggle(state);

    case Keys.enter:
      return handleActivate(state);

    case Keys.esc:
      return { ...state, overlay: null };

    case Keys.slash:
      return { ...state, searchMode: true };

    case Keys.question:
      return { ...state, overlay: Overlay.Help };

    case Keys.B:
      return { ...state, skipSong: { delta: 1, serialNumber: state.skipSong.serialNumber + 1 } };

    case Keys.Z:
      return { ...state, skipSong: { delta: -1, serialNumber: state.skipSong.serialNumber + 1 } };

    case Keys.S:
      return withGlobalAction(
        state,
        stateSet((last) => ({ shuffleMode: !last.shuffleMode })),
      );

    case Keys.C:
      return withGlobalAction(state, playPaused());

    case Keys.D:
      if (state.view === View.Queue && state.queue.active) {
        return withGlobalAction(state, queueRemoved(state.queue.active));
      }
      return state;

    case Keys.E:
      return addSelectedToQueue(state);

    case Keys.J:
      return handleScroll(state, 1);
    case Keys.K:
      return handleScroll(state, -1);

    case Keys.p:
      return handleOrder(state, 1);
    case Keys.P:
      return handleOrder(state, -1);

    case Keys.pageDown:
      return handleScroll(state, 20);
    case Keys.pageUp:
      return handleScroll(state, -20);

    default:
      return state;
  }
}
