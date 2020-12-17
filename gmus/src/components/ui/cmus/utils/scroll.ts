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

export function getScrollIndex(
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
