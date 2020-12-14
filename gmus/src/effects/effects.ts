import { ActionTypeLocal, ActionTypeRemote, AnyAction, RemoteAction } from '../actions';

export function globalEffects(lastAction: AnyAction | null): RemoteAction | null {
  if (!lastAction) {
    return null;
  }

  switch (lastAction.type) {
    case ActionTypeLocal.StateSet:
      return { type: ActionTypeRemote.StateSet, payload: lastAction.payload };

    default:
      return null;
  }
}
