import { Member, MusicPlayer } from '../types/state';
import { ActionErrorOccurred } from './error';
import { ActionLocal, ActionRemote, ActionTypeLocal, ActionTypeRemote } from './types';

export * from './types';

export type ActionStateSetRemote = ActionRemote<ActionTypeRemote.StateSet, MusicPlayer | null>;

export type ActionClientListUpdated = ActionRemote<ActionTypeRemote.ClientListUpdated, Member[]>;

export type RemoteAction = ActionStateSetRemote | ActionClientListUpdated;

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

export type ActionMasterRetaken = ActionLocal<ActionTypeLocal.MasterRetaken, null>;

export const masterRetaken = (): ActionMasterRetaken => ({
  type: ActionTypeLocal.MasterRetaken,
  payload: null,
});

export type LocalAction =
  | ActionErrorOccurred
  | ActionNameSet
  | ActionStateSetLocal
  | ActionSeeked
  | ActionMasterRetaken;

export type AnyAction = LocalAction | RemoteAction;
