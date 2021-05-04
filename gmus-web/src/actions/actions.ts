import type { SetStateAction } from 'react';

import type { Song } from '../types';
import type { Member, MusicPlayer } from '../types/state';
import type { ActionErrorOccurred } from './error';
import {
  ActionLocal,
  ActionRemote,
  ActionTypeLocal,
  ActionTypeRemote,
  LocalStateSetPayload,
} from './types';

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

export type ActionStateSetLocal = ActionLocal<ActionTypeLocal.StateSet, LocalStateSetPayload>;

export const stateSet = (
  payload: SetStateAction<Partial<MusicPlayer>> = {},
  priority = 0,
): ActionStateSetLocal => ({
  type: ActionTypeLocal.StateSet,
  payload: { payload, priority },
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

export type ActionActiveClientToggled = ActionLocal<ActionTypeLocal.ActiveClientToggled, string>;

export const activeClientToggled = (client: string): ActionActiveClientToggled => ({
  type: ActionTypeLocal.ActiveClientToggled,
  payload: client,
});

export type ActionPlayPaused = ActionLocal<ActionTypeLocal.PlayPaused, void>;

export const playPaused = (): ActionPlayPaused => ({
  type: ActionTypeLocal.PlayPaused,
  payload: undefined,
});

export type ActionSongInfoFetched = ActionLocal<
  ActionTypeLocal.SongInfoFetched,
  { song: Song | null; replace: boolean }
>;

export const songInfoFetched = (song: Song | null, replace = false): ActionSongInfoFetched => ({
  type: ActionTypeLocal.SongInfoFetched,
  payload: { song, replace },
});

export type ActionQueuePushed = ActionLocal<ActionTypeLocal.QueuePushed, number[]>;
export const queuePushed = (songIds: number[]): ActionQueuePushed => ({
  type: ActionTypeLocal.QueuePushed,
  payload: songIds,
});

export type ActionQueueShifted = ActionLocal<ActionTypeLocal.QueueShifted, void>;
export const queueShifted = (): ActionQueueShifted => ({
  type: ActionTypeLocal.QueueShifted,
  payload: undefined,
});

export type ActionQueueRemoved = ActionLocal<ActionTypeLocal.QueueRemoved, number>;
export const queueRemoved = (songId: number): ActionQueueRemoved => ({
  type: ActionTypeLocal.QueueRemoved,
  payload: songId,
});

export type ActionQueueOrdered = ActionLocal<
  ActionTypeLocal.QueueOrdered,
  { songId: number; delta: -1 | 1 }
>;
export const queueOrdered = (songId: number, delta: -1 | 1): ActionQueueOrdered => ({
  type: ActionTypeLocal.QueueOrdered,
  payload: { songId, delta },
});

export type LocalAction =
  | LoggedOut
  | ActionErrorOccurred
  | ActionNameSet
  | ActionStateSetLocal
  | ActionSeeked
  | ActionPlayPaused
  | ActionMasterSet
  | ActionActiveClientToggled
  | ActionSongInfoFetched
  | ActionQueuePushed
  | ActionQueueShifted
  | ActionQueueRemoved
  | ActionQueueOrdered;

export type AnyAction = LocalAction | RemoteAction;
