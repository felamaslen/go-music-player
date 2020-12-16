import { Action } from '../../../actions';
import { ActionKeyPressed } from '../../../hooks/vim';
import { Song } from '../../../types';
import { LibraryModeWindow } from './types';

export enum CmusUIActionType {
  ArtistsSet = '@@ui/cmus/ARTISTS_SET',
  ArtistAlbumsLoaded = '@@ui/cmus/ARTIST_ALBUMS_LOADED',
  ArtistSongsLoaded = '@@ui/cmus/ARTIST_SONGS_LOADED',
  LibraryModeSet = '@@ui/cmus/library/MODE_SET',
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

export type LibraryModeSet = Action<CmusUIActionType.LibraryModeSet, LibraryModeWindow>;

export const libraryModeSet = (mode: LibraryModeWindow): LibraryModeSet => ({
  type: CmusUIActionType.LibraryModeSet,
  payload: mode,
});

export type CmusUIAction =
  | ArtistsSet
  | ArtistAlbumsLoaded
  | ArtistSongsLoaded
  | LibraryModeSet
  | ActionKeyPressed;
