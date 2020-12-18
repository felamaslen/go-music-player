import { Member, MusicPlayer } from '../types/state';
import { ActionErrorOccurred } from './error';
import { ActionLocal, ActionRemote, ActionTypeLocal, ActionTypeRemote } from './types';

export * from './types';

export type ActionStateSetRemote = ActionRemote<ActionTypeRemote.StateSet, MusicPlayer | null>;

export type ActionClientListUpdated = ActionRemote<ActionTypeRemote.ClientListUpdated, Member[]>;

export type RemoteAction = ActionStateSetRemote | ActionClientListUpdated;

export type LoggedOut = ActionLocal<ActionTypeLocal.LoggedOut, void>;
export const loggedOut = (): LoggedOut => ({ type: ActionTypeLocal.LoggedOut, payload: undefined });

export type ActionNameSet = ActionLocal<ActionTypeLocal.NameSet, string>;

export const nameSet = (name: string): ActionNameSet => ({
  type: ActionTypeLocal.NameSet,
  payload: name,
});

export type ActionStateSetLocal = ActionLocal<
  ActionTypeLocal.StateSet,
  Omit<Partial<MusicPlayer>, 'seekTime'>
>;

export const stateSet = (state: Partial<MusicPlayer> = {}): ActionStateSetLocal => ({
  type: ActionTypeLocal.StateSet,
  payload: state,
});

export type ActionSeeked = ActionLocal<ActionTypeLocal.Seeked, number>;

export const seeked = (time: number): ActionSeeked => ({
  type: ActionTypeLocal.Seeked,
  payload: time,
});

export type ActionMasterSet = ActionLocal<ActionTypeLocal.MasterSet, string | undefined>;

export const masterSet = (name?: string): ActionMasterSet => ({
  type: ActionTypeLocal.MasterSet,
  payload: name,
});

export type ActionPlayPaused = ActionLocal<ActionTypeLocal.PlayPaused, void>;

export const playPaused = (): ActionPlayPaused => ({
  type: ActionTypeLocal.PlayPaused,
  payload: undefined,
});

export type LocalAction =
  | LoggedOut
  | ActionErrorOccurred
  | ActionNameSet
  | ActionStateSetLocal
  | ActionSeeked
  | ActionPlayPaused
  | ActionMasterSet;

export type AnyAction = LocalAction | RemoteAction;
