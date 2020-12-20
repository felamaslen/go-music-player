import { LocalAction } from '../../../../actions';
import { CmusUIState } from '../types';

export const withGlobalAction = (state: CmusUIState, action: LocalAction): CmusUIState => ({
  ...state,
  globalAction: action,
  globalActionSerialNumber: state.globalActionSerialNumber + 1,
});
