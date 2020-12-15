import { ActionTypeLocal, ActionTypeRemote, LocalAction, RemoteAction } from '../actions';
import { GlobalState } from '../reducer/types';

export function globalEffects(prevState: GlobalState, action: LocalAction): RemoteAction | null {
  switch (action.type) {
    case ActionTypeLocal.StateSet:
      return {
        type: ActionTypeRemote.StateSet,
        payload: { ...prevState.player, ...action.payload },
      };

    case ActionTypeLocal.Seeked:
      return {
        type: ActionTypeRemote.StateSet,
        payload: { ...prevState.player, seekTime: action.payload },
      };

    default:
      return null;
  }
}
