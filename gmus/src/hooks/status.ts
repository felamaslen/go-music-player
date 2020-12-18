import { AxiosInstance, AxiosResponse } from 'axios';
import { useCallback, useMemo, useState } from 'react';

import { Song } from '../types';
import { getApiUrl } from '../utils/url';
import { useCancellableRequest } from './request';

type SongInfoQuery = { id: number };

const sendSongInfoRequest = (
  axios: AxiosInstance,
  query: SongInfoQuery,
): Promise<AxiosResponse<Song>> => axios.get(`${getApiUrl()}/song-info?id=${query.id}`);

export function useCurrentlyPlayingSongInfo(songId: number | null): Song | null {
  const [songInfo, setSongInfo] = useState<Song | null>(null);
  const handleResponse = useCallback((res: Song) => {
    setSongInfo(res);
  }, []);

  const query = useMemo<SongInfoQuery>(() => (songId ? { id: songId } : { id: 0 }), [songId]);

  useCancellableRequest<SongInfoQuery, Song>({
    query,
    pause: !songId,
    sendRequest: sendSongInfoRequest,
    handleResponse,
  });
  return songInfo;
}
