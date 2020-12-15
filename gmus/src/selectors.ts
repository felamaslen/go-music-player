import { GlobalState } from './reducer/types';

export const isMaster = (state: GlobalState): boolean => state.player.master === state.myClientName;
