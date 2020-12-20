import { ArtistAlbumsLoaded, ArtistSongsLoaded, ArtistsSet } from '../actions';
import { CmusUIState } from '../types';

export const setArtists = (state: CmusUIState, action: ArtistsSet): CmusUIState => ({
  ...state,
  artists: action.payload,
  library: {
    ...state.library,
    activeArtist: action.payload[0] ?? null,
    activeAlbum: null,
  },
});

export const setArtistAlbums = (state: CmusUIState, action: ArtistAlbumsLoaded): CmusUIState => ({
  ...state,
  artistAlbums: { ...state.artistAlbums, [action.payload.artist]: action.payload.albums },
});

export const setArtistSongs = (state: CmusUIState, action: ArtistSongsLoaded): CmusUIState => ({
  ...state,
  artistSongs: { ...state.artistSongs, [action.payload.artist]: action.payload.songs },
  library: {
    ...state.library,
    activeSongId:
      state.library.activeArtist === action.payload.artist
        ? action.payload.songs[0]?.id ?? null
        : state.library.activeSongId,
  },
});
