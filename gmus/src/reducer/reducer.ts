import { ActionStateSetRemote, ActionTypeLocal, ActionTypeRemote, AnyAction } from '../actions';
import { isMaster } from '../selectors';
import { MusicPlayer } from '../types/state';
import { GlobalState } from './types';

export const nullPlayer: MusicPlayer = {
  songId: null,
  playing: false,
  currentTime: 0,
  master: '',
};

export const initialState: GlobalState = {
  lastAction: null,
  player: nullPlayer,
  clientList: [],
  myClientName: '',
};

function onRemoteStateSet(state: GlobalState, action: ActionStateSetRemote): GlobalState {
  const isAndWillBeMaster =
    isMaster(state) && !(action.payload?.master && action.payload.master !== state.player.master);

  const currentTime = isAndWillBeMaster
    ? state.player.currentTime
    : action.payload?.currentTime ?? state.player.currentTime;

  return { ...state, player: { ...(action.payload ?? nullPlayer), currentTime } };
}

export function globalReducer(state: GlobalState, action: AnyAction): GlobalState {
  switch (action.type) {
    case ActionTypeRemote.StateSet:
      return onRemoteStateSet(state, action);

    case ActionTypeLocal.StateSet:
      return { ...state, player: { ...state.player, ...action.payload } };

    case ActionTypeLocal.NameSet:
      return { ...state, myClientName: action.payload };

    case ActionTypeRemote.ClientListUpdated:
      return { ...state, clientList: action.payload };

    default:
      return state;
  }
}

export function composedGlobalReducer(state: GlobalState, action: AnyAction): GlobalState {
  return globalReducer(
    {
      ...state,
      lastAction: action,
    },
    action,
  );
}
