import { AxiosInstance, AxiosResponse } from 'axios';
import { useCallback, useEffect, useState } from 'react';

import { Song } from '../../types/songs';
import { getApiUrl } from '../../utils/url';
import { useRequestCallback } from '../request';

type ArtistsResponse = {
  artists: string[];
};

export function useArtists(): ArtistsResponse & {
  fetching: boolean;
} {
  const sendRequest = useCallback(
    (axios: AxiosInstance): Promise<AxiosResponse<ArtistsResponse>> =>
      axios.get(`${getApiUrl()}/artists`),
    [],
  );

  const [onFetch, response, fetching] = useRequestCallback<void, ArtistsResponse>({
    sendRequest,
  });

  useEffect(onFetch, [onFetch]);

  return { artists: response?.artists ?? [], fetching };
}

type ArtistDependencyResponse<K extends string, T> = { artist: string } & { [key in K]: T[] };

function useArtistDependency<K extends string, T>(
  key: K,
  artist: string,
  pause: boolean,
): [ArtistDependencyResponse<K, T> | null, boolean] {
  const sendRequest = useCallback(
    (axios: AxiosInstance, query: string): Promise<AxiosResponse<ArtistDependencyResponse<K, T>>> =>
      axios.get(`${getApiUrl()}/${key}?artist=${encodeURIComponent(query)}`),
    [key],
  );

  const [onFetch, response, fetching] = useRequestCallback<string, ArtistDependencyResponse<K, T>>({
    sendRequest,
  });

  const [hasLoadedByArtist, setHasLoadedByArtist] = useState<Record<string, boolean>>({});
  const hasLoadedThisArtist = !!hasLoadedByArtist[artist];

  useEffect(() => {
    if (!pause && !hasLoadedThisArtist) {
      onFetch(artist);
    }
  }, [onFetch, pause, hasLoadedThisArtist, artist]);

  useEffect(() => {
    if (response) {
      setHasLoadedByArtist((last) => ({ ...last, [response.artist]: true }));
    }
  }, [response]);

  return [response, fetching];
}

export function useArtistsAlbumsAndSongs(
  artist: string,
  pauseAlbums: boolean,
  pauseSongs: boolean,
): {
  albums: ArtistDependencyResponse<'albums', string> | null;
  songs: ArtistDependencyResponse<'songs', Song> | null;
  fetchingAlbums: boolean;
  fetchingSongs: boolean;
} {
  const [albums, fetchingAlbums] = useArtistDependency<'albums', string>(
    'albums',
    artist,
    pauseAlbums,
  );
  const [songs, fetchingSongs] = useArtistDependency<'songs', Song>('songs', artist, pauseSongs);

  return {
    albums,
    songs,
    fetchingAlbums,
    fetchingSongs,
  };
}
