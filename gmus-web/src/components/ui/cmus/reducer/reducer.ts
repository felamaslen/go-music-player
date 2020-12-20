import { createContext, Dispatch } from 'react';

import { nullDispatch } from '../../../../context/state';
import { ActionTypeKeyPressed } from '../../../../hooks/vim';
import { CmusUIAction, CmusUIActionType } from '../actions';
import { CmusUIState, LibraryModeWindow, View } from '../types';

import { setArtistAlbums, setArtists, setArtistSongs } from './artists';
import { onCommand } from './command';
import { handleKeyPress } from './keypress';

export const initialCmusUIState: CmusUIState = {
  globalAction: null,
  globalActionSerialNumber: 0,
  scroll: { delta: 0, serialNumber: 0 },
  skipSong: { delta: 0, serialNumber: 0 },
  view: View.Library,
  commandMode: false,
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
    visibleSongs: [],
  },
  clientList: {
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

    case CmusUIActionType.ClientActivated:
      return { ...state, clientList: { active: action.payload } };

    default:
      return state;
  }
}
