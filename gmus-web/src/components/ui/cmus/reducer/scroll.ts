import { Song } from '../../../../types';
import { scrollThroughItems } from '../../../../utils/delta';
import { CmusUIState, LibraryModeWindow, View } from '../types';
import { getNextActiveArtistAndAlbum } from '../utils/scroll';

const scrollSongs = (state: CmusUIState, delta: number): CmusUIState =>
  state.library.activeArtist === null
    ? state
    : {
        ...state,
        library: {
          ...state.library,
          activeSongId: scrollThroughItems(
            state.artistSongs[state.library.activeArtist] ?? [],
            (compare) => compare.id === state.library.activeSongId,
            delta,
          ).id,
        },
      };

function getActiveSongIdFromActiveArtistAlbum(
  activeArtist: string | null,
  activeAlbum: string | null,
  artistSongs: Record<string, Song[]>,
): number | null {
  if (activeArtist === null) {
    return null;
  }
  const songs = artistSongs[activeArtist] ?? [];
  if (!activeAlbum) {
    return songs[0]?.id ?? null;
  }
  return songs.find((compare) => compare.album === activeAlbum)?.id ?? null;
}

function scrollArtists(state: CmusUIState, delta: number): CmusUIState {
  const { artist, album } = getNextActiveArtistAndAlbum(
    state.artists,
    state.artistAlbums,
    state.library.activeArtist,
    state.library.activeAlbum,
    state.library.expandedArtists,
    delta,
  );

  return {
    ...state,
    library: {
      ...state.library,
      activeArtist: artist,
      activeAlbum: album,
      activeSongId: getActiveSongIdFromActiveArtistAlbum(artist, album, state.artistSongs),
    },
  };
}

function handleScrollLibrary(state: CmusUIState, delta: number): CmusUIState {
  switch (state.library.modeWindow) {
    case LibraryModeWindow.ArtistList:
      return scrollArtists(state, delta);
    case LibraryModeWindow.SongList:
      return scrollSongs(state, delta);
    default:
      return state;
  }
}

function handleScrollQueue(state: CmusUIState, delta: number): CmusUIState {
  const scrolledItem =
    scrollThroughItems(state.queue.info, (compare) => compare.id === state.queue.active, delta) ??
    state.queue.info[0];
  return {
    ...state,
    queue: {
      ...state.queue,
      active: scrolledItem?.id ?? null,
    },
  };
}

export function handleScroll(state: CmusUIState, delta: number): CmusUIState {
  switch (state.view) {
    case View.Library:
      return handleScrollLibrary(state, delta);
    case View.Queue:
      return handleScrollQueue(state, delta);
    default:
      return {
        ...state,
        scroll: { delta, serialNumber: state.scroll.serialNumber + 1 },
      };
  }
}
