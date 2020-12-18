import { ActionRemote, ActionStateSetLocal, ActionStateSetRemote } from './actions';
import { GlobalState } from './reducer/types';

export const isMaster = (state: Pick<GlobalState, 'player' | 'myClientName'>): boolean =>
  state.player.master === state.myClientName;

export const isFromOurselves = (
  state: Pick<GlobalState, 'myClientName'>,
  action: ActionRemote,
): boolean => state.myClientName === action.fromClient;

export const willBeMaster = (
  state: Partial<GlobalState> & Pick<GlobalState, 'myClientName'>,
  action: ActionStateSetLocal | ActionStateSetRemote,
): boolean => state.myClientName === action.payload?.master;

export const getSongId = (state: Pick<GlobalState, 'player'>): number | null => state.player.songId;
