import { Searched } from '../actions';
import { CmusUIState, LibraryModeWindow, View } from '../types';

function searchForArtist(state: CmusUIState, term: string): CmusUIState {
  const closestArtist = state.artists.find((compare) => compare.toLowerCase().startsWith(term));
  if (!closestArtist) {
    return state;
  }

  const activeSongId = state.artistSongs[closestArtist]?.[0]?.id ?? null;

  return {
    ...state,
    library: { ...state.library, activeArtist: closestArtist, activeAlbum: null, activeSongId },
  };
}

function searchForSong(state: CmusUIState, term: string): CmusUIState {
  if (!state.library.activeArtist) {
    return state;
  }
  const songsByArtist = state.artistSongs[state.library.activeArtist] ?? [];
  const filteredSongs = state.library.activeAlbum
    ? songsByArtist.filter(({ album }) => album === state.library.activeAlbum)
    : songsByArtist;

  const closestSong = filteredSongs.find((compare) => compare.title.toLowerCase().startsWith(term));
  if (!closestSong) {
    return state;
  }

  return { ...state, library: { ...state.library, activeSongId: closestSong.id } };
}

export function handleSearch(state: CmusUIState, action: Searched): CmusUIState {
  if (state.view !== View.Library) {
    return state;
  }
  if (action.payload === null) {
    return { ...state, searchMode: false };
  }
  if (!action.payload.length) {
    return state;
  }
  const termLower = action.payload?.toLowerCase() ?? '';
  switch (state.library.modeWindow) {
    case LibraryModeWindow.ArtistList:
      return searchForArtist(state, termLower);
    case LibraryModeWindow.SongList:
      return searchForSong(state, termLower);

    default:
      return state;
  }
}
