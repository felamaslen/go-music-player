import { MusicPlayer } from '../types/state';

interface Action<T extends string = string, P = unknown> {
  type: T;
  payload: P;
}

export enum ActionTypeRemote {
  StateSet = 'STATE_SET',
  ClientConnected = 'CLIENT_CONNECTED',
  ClientDisconnected = 'CLIENT_DISCONNECTED',
}

// Remote actions - these only come FROM the socket
export type ActionStateSetRemote = Action<ActionTypeRemote.StateSet, MusicPlayer | null>;

export type ActionClientConnected = Action<ActionTypeRemote.ClientConnected, string[]>;
export type ActionClientDisconnected = Action<ActionTypeRemote.ClientDisconnected, string[]>;

export type RemoteAction = ActionStateSetRemote | ActionClientConnected | ActionClientDisconnected;

// Local actions - these are dispatched from this client
export enum ActionTypeLocal {
  StateSet = '@@local/STATE_SET',
}

export type ActionStateSetLocal = Action<ActionTypeLocal.StateSet, MusicPlayer>;

export const stateSet = (state: MusicPlayer): ActionStateSetLocal => ({
  type: ActionTypeLocal.StateSet,
  payload: state,
});

export type LocalAction = ActionStateSetLocal;

export type AnyAction = LocalAction | RemoteAction;
