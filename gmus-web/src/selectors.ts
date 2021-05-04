import { ActionRemote, ActionStateSetLocal, ActionStateSetRemote } from './actions';
import { GlobalState } from './reducer/types';
import { MusicPlayer } from './types';

export function getNextPlayerStateFromAction(
  player: MusicPlayer | undefined,
  action: ActionStateSetLocal['payload'] | ActionStateSetRemote | null,
): MusicPlayer | null {
  if (!(action && player)) {
    return null;
  }
  const { payload } = action;
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

const isLocalStateSet = (
  action: ActionStateSetLocal | ActionStateSetRemote,
): action is ActionStateSetLocal => Reflect.has(action.payload ?? {}, 'priority');

export const willBeMaster = (
  state: Partial<GlobalState> & Pick<GlobalState, 'myClientName'>,
  fullAction: ActionStateSetLocal | ActionStateSetRemote,
): boolean => {
  const action: ActionStateSetLocal['payload'] | ActionStateSetRemote = isLocalStateSet(fullAction)
    ? fullAction.payload
    : fullAction;

  const actionHasMaster =
    typeof action.payload === 'function' ? !!action.payload({}).master : !!action.payload?.master;
  return (
    actionHasMaster &&
    state.myClientName === getNextPlayerStateFromAction(state.player, action)?.master
  );
};

export const getSongId = (state: Pick<GlobalState, 'player'>): number | null => state.player.songId;
