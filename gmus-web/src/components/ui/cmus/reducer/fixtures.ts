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
  library: {
    ...initialCmusUIState.library,
    activeArtist: 'My artist',
  },
};

export const stateWithActiveSong: CmusUIState = {
  ...stateLibrary,
  library: {
    ...stateLibrary.library,
    modeWindow: LibraryModeWindow.SongList,
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
