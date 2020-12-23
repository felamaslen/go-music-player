import { createSelector } from 'reselect';

import { Song } from '../../../types';
import { emptyArray } from '../../../utils/array';

import { CmusUIState } from './types';

export const getArtistSongs = (state: CmusUIState): Song[] =>
  state.library.activeArtist === null
    ? emptyArray
    : state.artistSongs[state.library.activeArtist] ?? emptyArray;

export const getActiveAlbum = (state: CmusUIState): string | null => state.library.activeAlbum;

export const getFilteredSongs = createSelector(
  getArtistSongs,
  getActiveAlbum,
  (songs, activeAlbum) =>
    activeAlbum === null ? songs : songs.filter(({ album }) => album === activeAlbum),
);
