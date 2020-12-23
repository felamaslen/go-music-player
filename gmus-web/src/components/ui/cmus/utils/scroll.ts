import { RefObject, useEffect } from 'react';
import { Song } from '../../../../types';

const getArtistAlbums = (
  artist: string | null,
  artistAlbums: Record<string, string[]>,
  expandedArtists: string[],
): string[] =>
  artist !== null && expandedArtists.includes(artist) ? artistAlbums[artist] ?? [] : [];

export function getNextActiveArtistAndAlbum(
  artists: string[],
  artistAlbums: Record<string, string[]>,
  activeArtist: string | null,
  activeAlbum: string | null,
  expandedArtists: string[],
  delta: number,
): { artist: string | null; album: string | null } {
  const activeArtistIndex = activeArtist === null ? -1 : artists.indexOf(activeArtist);

  if (activeArtistIndex === -1) {
    if (delta === 1) {
      return { artist: artists[0] ?? null, album: null };
    }
    const lastArtist = artists.length > 0 ? artists[artists.length - 1] : null;
    if (lastArtist === null) {
      return { artist: null, album: null };
    }
    const lastArtistAlbums = getArtistAlbums(lastArtist, artistAlbums, expandedArtists);

    const lastAlbum =
      lastArtistAlbums.length > 0 ? lastArtistAlbums[lastArtistAlbums.length - 1] : null;

    return { artist: lastArtist, album: lastAlbum };
  }

  const activeArtistAlbums = getArtistAlbums(activeArtist, artistAlbums, expandedArtists);
  const activeAlbumIndex = activeAlbum === null ? -1 : activeArtistAlbums.indexOf(activeAlbum);

  const reverse = delta < 0;
  const requiredDelta = Math.abs(delta);

  const activeArtistAlbumsSlice =
    delta > 0
      ? activeArtistAlbums.slice(activeAlbumIndex + 1)
      : activeArtistAlbums.slice(0, Math.max(0, activeAlbumIndex)).reverse();

  if (activeArtistAlbumsSlice.length >= requiredDelta) {
    const album = activeArtistAlbumsSlice[requiredDelta - 1];
    return { artist: activeArtist, album };
  }
  if (reverse && activeAlbum !== null && activeArtistAlbumsSlice.length === requiredDelta - 1) {
    return { artist: activeArtist, album: null };
  }

  const nextArtistsSlice = reverse
    ? artists.slice(0, activeArtistIndex).reverse()
    : artists.slice(activeArtistIndex + 1);

  const initialDelta =
    reverse && activeAlbum !== null
      ? activeArtistAlbumsSlice.length + 1
      : activeArtistAlbumsSlice.length;

  const reduction = nextArtistsSlice.reduce<{
    delta: number;
    artist: string | null;
    album: string | null;
  }>(
    (last, artist, index) => {
      const remainingDelta = requiredDelta - last.delta;
      if (remainingDelta < 1) {
        return last;
      }
      const thisArtistAlbums = getArtistAlbums(artist, artistAlbums, expandedArtists);
      if (reverse) {
        if (thisArtistAlbums.length >= remainingDelta) {
          return {
            artist,
            album: thisArtistAlbums[thisArtistAlbums.length - remainingDelta],
            delta: requiredDelta,
          };
        }
        if (
          thisArtistAlbums.length === remainingDelta - 1 ||
          index === nextArtistsSlice.length - 1
        ) {
          return { artist, album: null, delta: requiredDelta };
        }
        return { ...last, delta: last.delta + thisArtistAlbums.length + 1 };
      }
      if (remainingDelta === 1) {
        return { artist, album: null, delta: requiredDelta };
      }
      if (thisArtistAlbums.length >= remainingDelta - 1 || index === nextArtistsSlice.length - 1) {
        return {
          artist,
          album:
            thisArtistAlbums[Math.min(thisArtistAlbums.length - 1, remainingDelta - 2)] ?? null,
          delta: requiredDelta,
        };
      }
      return { ...last, delta: last.delta + thisArtistAlbums.length + 1 };
    },
    { delta: initialDelta, artist: activeArtist, album: activeAlbum },
  );

  return { artist: reduction.artist, album: reduction.album };
}

export function getArtistAlbumScrollIndex(
  artists: string[],
  artistAlbums: Record<string, string[]>,
  activeArtist: string | null,
  activeAlbum: string | null,
  expandedArtists: string[],
): number {
  if (activeArtist === null) {
    return 0;
  }
  const artistIndex = artists.indexOf(activeArtist);
  const activeArtistAlbums = getArtistAlbums(activeArtist, artistAlbums, expandedArtists);
  const activeAlbumIndex = activeAlbum ? activeArtistAlbums.indexOf(activeAlbum) : -1;

  const result = artists
    .slice(0, artistIndex)
    .reduce<number>(
      (last, artist) => last + 1 + getArtistAlbums(artist, artistAlbums, expandedArtists).length,
      activeAlbumIndex + 1,
    );

  return result;
}

export function getSongScrollIndex(
  filteredSongs: Pick<Song, 'id' | 'album'>[],
  activeSongId: number | null,
): number {
  const songIndex = filteredSongs.findIndex(({ id }) => id === activeSongId);
  if (songIndex === -1) {
    return -1;
  }
  const numUniqueAlbums = Array.from(
    new Set(filteredSongs.slice(0, songIndex + 1).map(({ album }) => album)),
  ).length;
  return songIndex + 2 * numUniqueAlbums;
}

export const lineHeight = 16;
export const scrollThresholdLines = 4;

export function useAutoJumpyScroll(ref: RefObject<HTMLDivElement>, scrollIndex: number): void {
  /* eslint-disable react-hooks/exhaustive-deps, no-param-reassign */
  useEffect(() => {
    if (!ref.current || scrollIndex === -1) {
      return;
    }
    const heightInLines = Math.floor(ref.current.offsetHeight / lineHeight);
    if (heightInLines < scrollThresholdLines + 1) {
      return;
    }

    const scrollPosLines = Math.floor(ref.current.scrollTop / lineHeight);

    const linesBefore = scrollIndex - scrollPosLines;
    const linesAfter = scrollPosLines + heightInLines - scrollIndex;

    if (linesBefore < 0 || linesAfter < 0) {
      ref.current.scrollTop = Math.max(0, (scrollIndex - 1) * lineHeight);
    } else if (linesAfter < scrollThresholdLines) {
      ref.current.scrollTop += (scrollThresholdLines - linesAfter) * lineHeight;
    } else if (linesBefore < scrollThresholdLines) {
      ref.current.scrollTop -= (scrollThresholdLines - linesBefore) * lineHeight;
    }
  }, [scrollIndex]);
  /* eslint-enable react-hooks/exhaustive-deps, no-param-reassign */
}
