import { Member, MusicPlayer } from '../types/state';

interface Action<T extends string = string, P = unknown> {
  type: T;
  payload: P;
}

export enum ActionTypeRemote {
  StateSet = 'STATE_SET',
  ClientListUpdated = 'CLIENT_LIST_UPDATED',
}

// Remote actions - these only come FROM the socket
export type ActionStateSetRemote = Action<ActionTypeRemote.StateSet, MusicPlayer | null>;

export type ActionClientListUpdated = Action<ActionTypeRemote.ClientListUpdated, Member[]>;

export type RemoteAction = ActionStateSetRemote | ActionClientListUpdated;

// Local actions - these are dispatched from this client
export enum ActionTypeLocal {
  NameSet = '@@local/NAME_SET',
  StateSet = '@@local/STATE_SET',
}

export type ActionNameSet = Action<ActionTypeLocal.NameSet, string>;

export const nameSet = (name: string): ActionNameSet => ({
  type: ActionTypeLocal.NameSet,
  payload: name,
});

export type ActionStateSetLocal = Action<ActionTypeLocal.StateSet, Partial<MusicPlayer>>;

export const stateSet = (state: Partial<MusicPlayer> = {}): ActionStateSetLocal => ({
  type: ActionTypeLocal.StateSet,
  payload: state,
});

export type LocalAction = ActionNameSet | ActionStateSetLocal;

export type AnyAction = LocalAction | RemoteAction;
