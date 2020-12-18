import {
  ActionStateSetLocal,
  ActionStateSetRemote,
  ActionTypeLocal,
  ActionTypeRemote,
  AnyAction,
} from '../actions';
import { isFromOurselves, isMaster, willBeMaster } from '../selectors';
import { MusicPlayer } from '../types/state';
import { GlobalState } from './types';

export const nullPlayer: MusicPlayer = {
  songId: null,
  playing: false,
  currentTime: 0,
  seekTime: -1,
  master: '',
};

export const initialState: GlobalState = {
  initialised: false,
  player: nullPlayer,
  clientList: [],
  myClientName: '',
};

function shouldSetSeekTime(state: GlobalState, action: ActionStateSetRemote): boolean {
  return willBeMaster(state, action) && !(isMaster(state) && isFromOurselves(state, action));
}

function onRemoteStateSet(state: GlobalState, action: ActionStateSetRemote): GlobalState {
  const nextPlayer = action.payload ?? nullPlayer;
  const seekTime = shouldSetSeekTime(state, action) ? nextPlayer.seekTime : -1;

  const nextPlayerWithSeekTime: MusicPlayer = { ...nextPlayer, seekTime };

  return { ...state, initialised: true, player: nextPlayerWithSeekTime };
}

function onLocalStateSet(state: GlobalState, action: ActionStateSetLocal): GlobalState {
  const nextPlayer: MusicPlayer = { ...state.player, ...action.payload };

  if (isMaster(state)) {
    return { ...state, player: nextPlayer };
  }

  if (willBeMaster(state, action)) {
    return {
      ...state,
      player: {
        ...nextPlayer,
        seekTime: nextPlayer.currentTime,
      },
    };
  }

  return state;
}

export function globalReducer(state: GlobalState, action: AnyAction): GlobalState {
  switch (action.type) {
    case ActionTypeRemote.StateSet:
      return onRemoteStateSet(state, action);

    case ActionTypeRemote.ClientListUpdated:
      return { ...state, clientList: action.payload };

    case ActionTypeLocal.NameSet:
      return { ...state, myClientName: action.payload };

    case ActionTypeLocal.StateSet:
      return onLocalStateSet(state, action);

    case ActionTypeLocal.Seeked:
      if (!isMaster(state)) {
        return state;
      }
      return { ...state, player: { ...state.player, seekTime: action.payload } };

    case ActionTypeLocal.MasterSet:
      if (action.payload) {
        return {
          ...state,
          player: {
            ...state.player,
            master: action.payload,
            seekTime: state.player.currentTime,
          },
        };
      }

      return {
        ...state,
        player: {
          ...state.player,
          master: state.myClientName,
          seekTime: state.player.currentTime,
          playing: false,
        },
      };

    case ActionTypeLocal.PlayPaused:
      if (!isMaster(state)) {
        return state;
      }
      return { ...state, player: { ...state.player, playing: !state.player.playing } };

    default:
      return state;
  }
}
