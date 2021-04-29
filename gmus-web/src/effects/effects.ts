import {
  ActionQueueOrdered,
  ActionQueuePushed,
  ActionStateSetLocal,
  ActionTypeLocal,
  ActionTypeRemote,
  LocalAction,
  RemoteAction,
} from '../actions';
import { GlobalState } from '../reducer/types';
import { getNextPlayerStateFromAction, isMaster } from '../selectors';

const reverseInArray = <T>(array: T[], index: number): T[] => [
  ...array.slice(0, Math.max(0, index)),
  ...array.slice(Math.max(0, index), index + 2).reverse(),
  ...array.slice(index + 2),
];

function reorderQueue(queue: number[], action: ActionQueueOrdered): number[] {
  const currentIndex = queue.indexOf(action.payload.songId);
  if (currentIndex === -1) {
    return queue;
  }

  const reverseIndex = action.payload.delta === 1 ? currentIndex : currentIndex - 1;
  return reverseInArray(queue, reverseIndex);
}

function pushToQueue(state: GlobalState, action: ActionQueuePushed): RemoteAction | null {
  const nextQueue = Array.from(new Set([...state.player.queue, ...action.payload]));
  if (!state.player.master || nextQueue.length === state.player.queue.length) {
    return null;
  }
  return {
    type: ActionTypeRemote.StateSet,
    payload: {
      ...state.player,
      queue: nextQueue,
    },
  };
}

function sendStateUpdateToServer(
  state: GlobalState,
  action: ActionStateSetLocal,
): RemoteAction | null {
  const nextPlayer = getNextPlayerStateFromAction(state.player, action.payload);
  if (!state.player.master && !nextPlayer?.master) {
    return null;
  }
  return {
    type: ActionTypeRemote.StateSet,
    payload: nextPlayer,
  };
}

export function globalEffects(state: GlobalState, action: LocalAction): RemoteAction | null {
  switch (action.type) {
    case ActionTypeLocal.StateSet:
      return sendStateUpdateToServer(state, action);

    case ActionTypeLocal.Seeked:
      if (!state.player.master) {
        return null;
      }
      return {
        type: ActionTypeRemote.StateSet,
        payload: { ...state.player, seekTime: action.payload },
      };

    case ActionTypeLocal.MasterSet:
      if (action.payload) {
        return {
          type: ActionTypeRemote.StateSet,
          payload: {
            ...state.player,
            seekTime: state.player.currentTime,
            master: action.payload,
          },
        };
      }

      return {
        type: ActionTypeRemote.StateSet,
        payload: {
          ...state.player,
          playing: false,
          seekTime: -1,
          master: state.myClientName,
        },
      };

    case ActionTypeLocal.ActiveClientToggled:
      return {
        type: ActionTypeRemote.StateSet,
        payload: {
          ...state.player,
          activeClients: state.player.activeClients.includes(action.payload)
            ? state.player.activeClients.filter((client) => client !== action.payload)
            : [...state.player.activeClients, action.payload],
        },
      };

    case ActionTypeLocal.PlayPaused:
      return {
        type: ActionTypeRemote.StateSet,
        payload: {
          ...state.player,
          playing: !state.player.playing,
        },
      };

    case ActionTypeLocal.SongInfoFetched:
      if (isMaster(state) || !action.payload.replace || !state.player.master) {
        return null;
      }
      return {
        type: ActionTypeRemote.StateSet,
        payload: {
          ...state.player,
          songId: action.payload.song?.id ?? null,
          playing: !!action.payload.song,
          currentTime: 0,
          seekTime: 0,
        },
      };

    case ActionTypeLocal.QueuePushed:
      return pushToQueue(state, action);
    case ActionTypeLocal.QueueShifted:
      if (!state.player.master) {
        return null;
      }
      return {
        type: ActionTypeRemote.StateSet,
        payload: {
          ...state.player,
          queue: state.player.queue.slice(1),
          playing: !!state.player.queue[0],
          songId: state.player.queue[0],
          currentTime: 0,
          seekTime: 0,
        },
      };
    case ActionTypeLocal.QueueRemoved:
      if (!state.player.master) {
        return null;
      }
      return {
        type: ActionTypeRemote.StateSet,
        payload: {
          ...state.player,
          queue: state.player.queue.filter((id) => id !== action.payload),
        },
      };
    case ActionTypeLocal.QueueOrdered:
      return {
        type: ActionTypeRemote.StateSet,
        payload: { ...state.player, queue: reorderQueue(state.player.queue, action) },
      };

    default:
      return null;
  }
}
