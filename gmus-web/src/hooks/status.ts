import { AxiosInstance, AxiosResponse } from 'axios';
import { useCallback, useContext, useEffect } from 'react';
import { songInfoFetched } from '../actions';
import { DispatchContext, StateContext } from '../context/state';

import { Song } from '../types';
import { getApiUrl } from '../utils/url';
import { useRequestCallback } from './request';

export function useCurrentlyPlayingSongInfo(): void {
  const state = useContext(StateContext);
  const dispatch = useContext(DispatchContext);

  const sendRequest = useCallback(
    (axios: AxiosInstance, id: number): Promise<AxiosResponse<Song>> =>
      axios.get(`${getApiUrl()}/song-info?id=${id}`),
    [],
  );

  const [onFetch, response, , cancelRequest] = useRequestCallback<number, Song>({ sendRequest });

  useEffect(() => {
    if (state.player.songId) {
      if (state.player.songId === state.songInfo?.id) {
        cancelRequest.current?.();
      } else {
        onFetch(state.player.songId);
      }
    } else if (state.songInfo?.id) {
      cancelRequest.current?.();
      dispatch(songInfoFetched(null));
    }
  }, [dispatch, state.player.songId, state.songInfo?.id, onFetch, cancelRequest]);

  useEffect(() => {
    if (response?.id === state.player.songId) {
      dispatch(songInfoFetched(response));
    }
  }, [dispatch, response, state.player.songId]);
}
