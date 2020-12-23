import { Song } from '../../../../types';
import { CmusUIState, LibraryModeWindow, View } from '../types';
import { initialCmusUIState } from './reducer';

export const stateLibrary: CmusUIState = {
  ...initialCmusUIState,
  view: View.Library,
};

export const stateCommandMode: CmusUIState = {
  ...stateLibrary,
  commandMode: true,
};

export const stateDifferentView: CmusUIState = {
  ...initialCmusUIState,
  view: (undefined as unknown) as View,
  scroll: { delta: 0, serialNumber: 8813 },
};

export const stateFromMode = (fromModeWindow: LibraryModeWindow): CmusUIState => ({
  ...stateLibrary,
  library: {
    ...stateLibrary.library,
    modeWindow: fromModeWindow,
  },
});

export const stateWithActiveArtist: CmusUIState = {
  ...initialCmusUIState,
  artistSongs: {
    'My artist': [{ id: 184, album: 'Album 1' } as Song, { id: 37, album: 'Album 2' } as Song],
  },
  library: {
    ...initialCmusUIState.library,
    activeArtist: 'My artist',
  },
};

export const stateWithActiveSong: CmusUIState = {
  ...stateLibrary,
  artistSongs: {
    'My artist': [
      { id: 1867 } as Song,
      { id: 1870, album: 'Different album' } as Song,
      { id: 46, album: 'My album' } as Song,
    ],
  },
  library: {
    ...stateLibrary.library,
    modeWindow: LibraryModeWindow.SongList,
    activeArtist: 'My artist',
    activeAlbum: 'My album',
    activeSongId: 1867,
  },
};

export const stateQueue: CmusUIState = {
  ...initialCmusUIState,
  view: View.Queue,
  queue: {
    info: [{ id: 887 } as Song, { id: 75 } as Song, { id: 189 } as Song],
    active: null,
  },
};

export const stateSearching: CmusUIState = { ...initialCmusUIState, searchMode: true };
