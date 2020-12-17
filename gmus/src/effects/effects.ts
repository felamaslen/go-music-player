import { ActionTypeLocal, ActionTypeRemote, LocalAction, RemoteAction } from '../actions';
import { GlobalState } from '../reducer/types';
import { isMaster } from '../selectors';

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

    case ActionTypeLocal.MasterRetaken:
      return {
        type: ActionTypeRemote.StateSet,
        payload: {
          ...prevState.player,
          playing: false,
          seekTime: -1,
          master: prevState.myClientName,
        },
      };

    case ActionTypeLocal.PlayPaused:
      if (isMaster(prevState)) {
        return null;
      }
      return {
        type: ActionTypeRemote.StateSet,
        payload: {
          ...prevState.player,
          playing: !prevState.player.playing,
        },
      };

    default:
      return null;
  }
}
