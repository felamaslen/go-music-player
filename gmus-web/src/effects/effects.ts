import {
  ActionQueueOrdered,
  ActionTypeLocal,
  ActionTypeRemote,
  LocalAction,
  RemoteAction,
} from '../actions';
import { GlobalState } from '../reducer/types';
import { isMaster } from '../selectors';

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

export function globalEffects(prevState: GlobalState, action: LocalAction): RemoteAction | null {
  switch (action.type) {
    case ActionTypeLocal.StateSet:
      if (!prevState.player.master && !action.payload.master) {
        return null;
      }
      return {
        type: ActionTypeRemote.StateSet,
        payload: { ...prevState.player, ...action.payload },
      };

    case ActionTypeLocal.Seeked:
      if (!prevState.player.master) {
        return null;
      }
      return {
        type: ActionTypeRemote.StateSet,
        payload: { ...prevState.player, seekTime: action.payload },
      };

    case ActionTypeLocal.MasterSet:
      if (action.payload) {
        return {
          type: ActionTypeRemote.StateSet,
          payload: {
            ...prevState.player,
            seekTime: prevState.player.currentTime,
            master: action.payload,
          },
        };
      }

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

    case ActionTypeLocal.SongInfoFetched:
      if (isMaster(prevState) || !action.payload.replace || !prevState.player.master) {
        return null;
      }
      return {
        type: ActionTypeRemote.StateSet,
        payload: {
          ...prevState.player,
          songId: action.payload.song?.id ?? null,
          playing: !!action.payload.song,
          currentTime: 0,
          seekTime: 0,
        },
      };

    case ActionTypeLocal.QueuePushed:
      if (!prevState.player.master || prevState.player.queue.includes(action.payload)) {
        return null;
      }
      return {
        type: ActionTypeRemote.StateSet,
        payload: {
          ...prevState.player,
          queue: [...prevState.player.queue, action.payload],
        },
      };
    case ActionTypeLocal.QueueShifted:
      if (!prevState.player.master) {
        return null;
      }
      return {
        type: ActionTypeRemote.StateSet,
        payload: {
          ...prevState.player,
          queue: prevState.player.queue.slice(1),
          playing: !!prevState.player.queue[0],
          songId: prevState.player.queue[0],
          currentTime: 0,
          seekTime: 0,
        },
      };
    case ActionTypeLocal.QueueRemoved:
      if (!prevState.player.master) {
        return null;
      }
      return {
        type: ActionTypeRemote.StateSet,
        payload: {
          ...prevState.player,
          queue: prevState.player.queue.filter((id) => id !== action.payload),
        },
      };
    case ActionTypeLocal.QueueOrdered:
      return {
        type: ActionTypeRemote.StateSet,
        payload: { ...prevState.player, queue: reorderQueue(prevState.player.queue, action) },
      };

    default:
      return null;
  }
}