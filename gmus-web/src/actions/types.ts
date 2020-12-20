// Remote actions - these only come FROM the socket
export enum ActionTypeRemote {
  StateSet = 'STATE_SET',
  ClientListUpdated = 'CLIENT_LIST_UPDATED',
}

// Local actions - these are dispatched from this client
export enum ActionTypeLocal {
  LoggedOut = '@@local/LOGGED_OUT',
  ErrorOccurred = '@@local/ERROR_OCCURRED',
  NameSet = '@@local/NAME_SET',
  StateSet = '@@local/STATE_SET',
  Seeked = '@@local/SEEKED',
  MasterSet = '@@local/MASTER_SET',
  PlayPaused = '@@local/PLAY_PAUSED',
  SongInfoFetched = '@@local/SONG_INFO_FETCHED',
}

export interface Action<T extends string = string, P = unknown> {
  type: T;
  payload: P;
}

export type ActionRemote<T extends ActionTypeRemote = ActionTypeRemote, P = unknown> = Action<
  T,
  P
> & { fromClient?: string | null };

export type ActionLocal<T extends ActionTypeLocal = ActionTypeLocal, P = unknown> = Action<T, P>;
