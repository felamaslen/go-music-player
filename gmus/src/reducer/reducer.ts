import { ActionTypeLocal, ActionTypeRemote, AnyAction } from '../actions';
import { MusicPlayer } from '../types/state';

export type GlobalState = {
  lastAction: AnyAction | null;
  player: MusicPlayer;
  clientList: string[];
};

const nullPlayer: MusicPlayer = {
  songId: null,
  playing: false,
  playTimeSeconds: 0,
  currentClient: '',
};

export const initialState: GlobalState = {
  lastAction: null,
  player: nullPlayer,
  clientList: [],
};

export function globalReducer(state: GlobalState, action: AnyAction): GlobalState {
  switch (action.type) {
    case ActionTypeRemote.StateSet:
    case ActionTypeLocal.StateSet:
      return { ...state, player: action.payload ?? nullPlayer };

    case ActionTypeRemote.ClientConnected:
    case ActionTypeRemote.ClientDisconnected:
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
