import { ActionRemote, ActionStateSetLocal, ActionStateSetRemote } from './actions';
import { GlobalState } from './reducer/types';

export const isMaster = (state: GlobalState): boolean => state.player.master === state.myClientName;

export const isFromOurselves = (state: GlobalState, action: ActionRemote): boolean =>
  state.myClientName === action.fromClient;

export const willBeMaster = (
  state: GlobalState,
  action: ActionStateSetLocal | ActionStateSetRemote,
): boolean => state.myClientName === action.payload?.master;
