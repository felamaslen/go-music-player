import { loggedOut } from '../../../../actions';
import { CommandSet } from '../actions';
import { CmusUIState } from '../types';
import { withGlobalAction } from './utils';

export function onCommand(state: CmusUIState, action: CommandSet): CmusUIState {
  const nextState: CmusUIState = { ...state, commandMode: false };

  switch (action.payload) {
    case 'q':
      return withGlobalAction(nextState, loggedOut());
    default:
      return nextState;
  }
}
