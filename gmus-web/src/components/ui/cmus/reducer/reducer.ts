import { createContext, Dispatch } from 'react';

import { nullDispatch } from '../../../../context/state';
import { ActionTypeKeyPressed } from '../../../../hooks/vim';
import { CmusUIAction, CmusUIActionType } from '../actions';
import { CmusUIState, LibraryModeWindow, View } from '../types';

import { setArtistAlbums, setArtists, setArtistSongs } from './artists';
import { onCommand } from './command';
import { handleKeyPress } from './keypress';
import { handleSearch } from './search';

export const initialCmusUIState: CmusUIState = {
  globalAction: null,
  globalActionSerialNumber: 0,
  scroll: { delta: 0, serialNumber: 0 },
  skipSong: { delta: 0, serialNumber: 0 },
  view: View.Library,
  commandMode: false,
  searchMode: false,
  overlay: null,
  artists: [],
  artistAlbums: {},
  artistSongs: {},
  library: {
    modeWindow: LibraryModeWindow.ArtistList,
    expandedArtists: [],
    activeArtist: null,
    activeAlbum: null,
    activeSongId: null,
  },
  clientList: {
    active: null,
  },
  queue: {
    info: [],
    active: null,
  },
};

export const CmusUIStateContext = createContext<CmusUIState>(initialCmusUIState);
export const CmusUIDispatchContext = createContext<Dispatch<CmusUIAction>>(nullDispatch);

export function cmusUIReducer(state: CmusUIState, action: CmusUIAction): CmusUIState {
  switch (action.type) {
    case ActionTypeKeyPressed:
      return handleKeyPress(state, action);

    case CmusUIActionType.ArtistsSet:
      return setArtists(state, action);
    case CmusUIActionType.ArtistAlbumsLoaded:
      return setArtistAlbums(state, action);
    case CmusUIActionType.ArtistSongsLoaded:
      return setArtistSongs(state, action);

    case CmusUIActionType.CommandSet:
      return onCommand(state, action);

    case CmusUIActionType.Searched:
      return handleSearch(state, action);

    case CmusUIActionType.ClientActivated:
      return { ...state, clientList: { active: action.payload } };

    case CmusUIActionType.QueueInfoLoaded:
      return {
        ...state,
        queue: {
          info: action.payload,
          active: action.payload.some(({ id }) => id === state.queue.active)
            ? state.queue.active
            : action.payload[0]?.id ?? null,
        },
      };

    default:
      return state;
  }
}
