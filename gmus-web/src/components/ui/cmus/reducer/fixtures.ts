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
