import { ActionRemote, ActionStateSetLocal, ActionStateSetRemote } from './actions';
import { GlobalState } from './reducer/types';
import { MusicPlayer } from './types';

export function getNextPlayerStateFromAction(
  player: MusicPlayer | undefined,
  payload: ActionStateSetLocal['payload'] | null,
): MusicPlayer | null {
  if (!(payload && player)) {
    return null;
  }
  if (typeof payload === 'function') {
    return { ...player, ...payload(player) };
  }
  return { ...player, ...payload };
}

export const isMaster = (state: Pick<GlobalState, 'player' | 'myClientName'>): boolean =>
  state.player.master === state.myClientName;

export const isActiveClient = (state: Pick<GlobalState, 'player' | 'myClientName'>): boolean =>
  isMaster(state) || state.player.activeClients.includes(state.myClientName);

export const isFromOurselves = (
  state: Pick<GlobalState, 'myClientName'>,
  action: ActionRemote,
): boolean => state.myClientName === action.fromClient;

export const willBeMaster = (
  state: Partial<GlobalState> & Pick<GlobalState, 'myClientName'>,
  action: ActionStateSetLocal | ActionStateSetRemote,
): boolean => {
  const actionHasMaster =
    typeof action.payload === 'function' ? !!action.payload({}).master : !!action.payload?.master;
  return (
    actionHasMaster &&
    state.myClientName === getNextPlayerStateFromAction(state.player, action.payload)?.master
  );
};

export const getSongId = (state: Pick<GlobalState, 'player'>): number | null => state.player.songId;
