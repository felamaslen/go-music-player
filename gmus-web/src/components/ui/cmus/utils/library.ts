import { useDebounce } from '@react-hook/debounce';
import { Dispatch, useEffect } from 'react';

import { useArtists, useArtistsAlbumsAndSongs } from '../../../../hooks/fetch/artists';

import { artistAlbumsLoaded, artistSongsLoaded, artistsSet, CmusUIAction } from '../actions';
import { CmusUIState } from '../types';

export function useLibrary(
  { library: { activeArtist, expandedArtists } }: CmusUIState,
  dispatchUI: Dispatch<CmusUIAction>,
): void {
  const { artists } = useArtists();
  useEffect(() => {
    dispatchUI(artistsSet(artists));
  }, [dispatchUI, artists]);

  const [debouncedActiveArtist, setDebouncedActiveArtist] = useDebounce(activeArtist, 200);
  useEffect(() => {
    setDebouncedActiveArtist(activeArtist);
  }, [activeArtist, setDebouncedActiveArtist]);

  const { albums, songs } = useArtistsAlbumsAndSongs(
    debouncedActiveArtist ?? '',
    debouncedActiveArtist === null || !expandedArtists.includes(debouncedActiveArtist),
    debouncedActiveArtist === null,
  );
  useEffect(() => {
    if (albums) {
      dispatchUI(artistAlbumsLoaded(albums.artist, albums.albums));
    }
  }, [dispatchUI, albums]);
  useEffect(() => {
    if (songs) {
      dispatchUI(artistSongsLoaded(songs.artist, songs.songs));
    }
  }, [dispatchUI, songs]);
}
