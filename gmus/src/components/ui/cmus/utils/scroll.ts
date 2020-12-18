import { RefObject, useEffect } from 'react';
import { Song } from '../../../../types';
import { scrollThroughItems } from '../../../../utils/delta';

const getArtistAlbums = (
  artist: string | null,
  artistAlbums: Record<string, string[]>,
  expandedArtists: string[],
): string[] => (artist && expandedArtists.includes(artist) ? artistAlbums[artist] ?? [] : []);

export function getNextActiveArtistAndAlbum(
  artists: string[],
  artistAlbums: Record<string, string[]>,
  activeArtist: string | null,
  activeAlbum: string | null,
  expandedArtists: string[],
  delta: -1 | 1,
): { artist: string | null; album: string | null } {
  if (activeArtist === null) {
    if (delta === 1) {
      return { artist: artists[0] ?? null, album: null };
    }
    const lastArtist = artists.length > 0 ? artists[artists.length - 1] : null;
    if (!lastArtist) {
      return { artist: null, album: null };
    }
    const lastArtistAlbums = getArtistAlbums(lastArtist, artistAlbums, expandedArtists);

    const lastAlbum =
      lastArtistAlbums.length > 0 ? lastArtistAlbums[lastArtistAlbums.length - 1] : null;

    return { artist: lastArtist, album: lastAlbum };
  }

  const nextArtist = scrollThroughItems(artists, (compare) => compare === activeArtist, delta);
  const atEnd = nextArtist === activeArtist;

  const activeArtistAlbums = getArtistAlbums(activeArtist, artistAlbums, expandedArtists);
  const nextArtistAlbums = getArtistAlbums(nextArtist, artistAlbums, expandedArtists);

  if (activeAlbum === null) {
    if (
      (delta === 1 && !activeArtistAlbums.length) ||
      (delta === -1 && (atEnd || !nextArtistAlbums.length))
    ) {
      return { artist: nextArtist, album: null };
    }
    if (delta === 1) {
      return { artist: activeArtist, album: activeArtistAlbums[0] };
    }
    return { artist: nextArtist, album: nextArtistAlbums[nextArtistAlbums.length - 1] };
  }

  const nextAlbum = scrollThroughItems(
    activeArtistAlbums,
    (compare) => compare === activeAlbum,
    delta,
  );

  if (delta === -1 && nextAlbum === activeAlbum) {
    return { artist: activeArtist, album: null };
  }
  if (delta === 1 && nextArtist !== activeArtist && nextAlbum === activeAlbum) {
    return { artist: nextArtist, album: null };
  }

  return { artist: activeArtist, album: nextAlbum };
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
  filteredSongs: Pick<Song, 'id'>[],
  activeSongId: number | null,
): number {
  if (activeSongId === null) {
    return -1;
  }
  return filteredSongs.findIndex(({ id }) => id === activeSongId);
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
      ref.current.scrollTop += lineHeight;
    } else if (linesBefore < scrollThresholdLines) {
      ref.current.scrollTop -= lineHeight;
    }
  }, [scrollIndex]);
  /* eslint-enable react-hooks/exhaustive-deps, no-param-reassign */
}
