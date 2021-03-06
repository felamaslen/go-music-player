import { Action } from '../../../actions';
import { ActionKeyPressed } from '../../../hooks/vim';
import { Song } from '../../../types';

export enum CmusUIActionType {
  ArtistsSet = '@@ui/cmus/ARTISTS_SET',
  ArtistAlbumsLoaded = '@@ui/cmus/ARTIST_ALBUMS_LOADED',
  ArtistSongsLoaded = '@@ui/cmus/ARTIST_SONGS_LOADED',
  CommandSet = '@@ui/cmus/COMMAND_SET',
  ClientActivated = '@@ui/cmus/CLIENT_ACTIVATED',
  QueueInfoLoaded = '@@ui/cmus/QUEUE_INFO_LOADED',
  Searched = '@@ui/cmus/SEARCHED',
}

export type ArtistsSet = Action<CmusUIActionType.ArtistsSet, string[]>;

export const artistsSet = (artists: string[]): ArtistsSet => ({
  type: CmusUIActionType.ArtistsSet,
  payload: artists,
});

export type ArtistAlbumsLoaded = Action<
  CmusUIActionType.ArtistAlbumsLoaded,
  {
    artist: string;
    albums: string[];
  }
>;

export const artistAlbumsLoaded = (artist: string, albums: string[]): ArtistAlbumsLoaded => ({
  type: CmusUIActionType.ArtistAlbumsLoaded,
  payload: { artist, albums },
});

export type ArtistSongsLoaded = Action<
  CmusUIActionType.ArtistSongsLoaded,
  {
    artist: string;
    songs: Song[];
  }
>;

export const artistSongsLoaded = (artist: string, songs: Song[]): ArtistSongsLoaded => ({
  type: CmusUIActionType.ArtistSongsLoaded,
  payload: { artist, songs },
});

export type CommandSet = Action<CmusUIActionType.CommandSet, string | null>;

export const commandSet = (command: string | null): CommandSet => ({
  type: CmusUIActionType.CommandSet,
  payload: command,
});

export type ClientActivated = Action<CmusUIActionType.ClientActivated, string | null>;

export const clientActivated = (name: string | null): ClientActivated => ({
  type: CmusUIActionType.ClientActivated,
  payload: name,
});

export type QueueInfoLoaded = Action<CmusUIActionType.QueueInfoLoaded, Song[]>;

export const queueInfoLoaded = (songs: Song[]): QueueInfoLoaded => ({
  type: CmusUIActionType.QueueInfoLoaded,
  payload: songs,
});

export type Searched = Action<CmusUIActionType.Searched, string | null>;

export const searched = (term: string | null): Searched => ({
  type: CmusUIActionType.Searched,
  payload: term,
});

export type CmusUIAction =
  | ArtistsSet
  | ArtistAlbumsLoaded
  | ArtistSongsLoaded
  | CommandSet
  | ClientActivated
  | QueueInfoLoaded
  | Searched
  | ActionKeyPressed;
