import { ActionTypeLocal, ActionTypeRemote, RemoteAction } from '../actions';
import { GlobalState } from '../reducer';

export function globalEffects(state: GlobalState): RemoteAction | null {
  if (!state.lastAction) {
    return null;
  }

  switch (state.lastAction.type) {
    case ActionTypeLocal.StateSet:
      return { type: ActionTypeRemote.StateSet, payload: state.player };

    default:
      return null;
  }
}
