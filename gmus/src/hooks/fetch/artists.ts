import { AxiosInstance, AxiosResponse } from 'axios';
import { useCallback, useMemo, useState } from 'react';

import { Song } from '../../types/songs';
import { getApiUrl } from '../../utils/url';
import { useCancellableRequest } from '../request';

type ArtistsResponse = {
  artists: string[];
  more: boolean;
};

type ArtistsQuery = {
  limit: number;
  page: number;
};

const sendArtistsRequest = (
  axios: AxiosInstance,
  query: ArtistsQuery,
): Promise<AxiosResponse<ArtistsResponse>> =>
  axios.get(`${getApiUrl()}/artists?limit=${query.limit}&page=${query.page}`);

type AlbumsResponse = {
  artist: string;
  albums: string[];
};

type AlbumsQuery = {
  artist: string;
};

const sendAlbumsRequest = (
  axios: AxiosInstance,
  query: AlbumsQuery,
): Promise<AxiosResponse<AlbumsResponse>> =>
  axios.get(`${getApiUrl()}/albums?artist=${query.artist}`);

type SongsResponse = {
  artist: string;
  songs: Song[];
};

type SongsQuery = AlbumsQuery;

const sendSongsRequest = (
  axios: AxiosInstance,
  query: SongsQuery,
): Promise<AxiosResponse<SongsResponse>> =>
  axios.get(`${getApiUrl()}/songs?artist=${encodeURIComponent(query.artist)}`);

export function useArtists(): ArtistsResponse & {
  fetching: boolean;
  fetchMore: () => void;
} {
  const [limit] = useState<number>(100);
  const [page, setPage] = useState<number>(0);

  const [artists, setArtists] = useState<string[]>([]);
  const [more, setMore] = useState<boolean>(true);

  const [pause, setPause] = useState<boolean>(false);

  const query = useMemo<ArtistsQuery>(() => ({ limit, page }), [limit, page]);

  const handleResponse = useCallback((response: ArtistsResponse) => {
    setMore(response.more);
    setArtists((last) => Array.from(new Set([...last, ...response.artists])));
    setPause(true);
  }, []);

  const fetching = useCancellableRequest<ArtistsQuery, ArtistsResponse>({
    query,
    pause,
    sendRequest: sendArtistsRequest,
    handleResponse,
  });

  const fetchMore = useCallback(() => {
    if (!more) {
      return;
    }
    setPage((last) => last + 1);
    setPause(false);
  }, [more]);

  return { artists, more, fetching, fetchMore };
}

export function useArtistsAlbumsAndSongs(
  artist: string,
  pauseAlbums: boolean,
  pauseSongs: boolean,
): {
  albums: AlbumsResponse | undefined;
  songs: SongsResponse | undefined;
  fetchingAlbums: boolean;
  fetchingSongs: boolean;
} {
  const [hasLoadedAlbums, setHasLoadedAlbums] = useState<Record<string, boolean>>({});
  const [hasLoadedSongs, setHasLoadedSongs] = useState<Record<string, boolean>>({});

  const query = useMemo<AlbumsQuery>(() => ({ artist }), [artist]);

  const [albums, setAlbums] = useState<AlbumsResponse | undefined>();
  const [songs, setSongs] = useState<SongsResponse | undefined>();

  const handleAlbumsResponse = useCallback((response: AlbumsResponse) => {
    setAlbums(response);
    setHasLoadedAlbums((last) => ({ ...last, [response.artist]: true }));
  }, []);

  const handleSongsResponse = useCallback((response: SongsResponse) => {
    setSongs(response);
    setHasLoadedSongs((last) => ({ ...last, [response.artist]: true }));
  }, []);

  const fetchingAlbums = useCancellableRequest<AlbumsQuery, AlbumsResponse>({
    query,
    pause: pauseAlbums || hasLoadedAlbums[artist],
    sendRequest: sendAlbumsRequest,
    handleResponse: handleAlbumsResponse,
  });

  const fetchingSongs = useCancellableRequest<SongsQuery, SongsResponse>({
    query,
    pause: pauseSongs || hasLoadedSongs[artist],
    sendRequest: sendSongsRequest,
    handleResponse: handleSongsResponse,
  });

  return {
    albums,
    songs,
    fetchingAlbums,
    fetchingSongs,
  };
}
