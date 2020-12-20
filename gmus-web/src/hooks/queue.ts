import { useThrottleCallback } from '@react-hook/throttle';
import { AxiosInstance, AxiosResponse } from 'axios';
import { Dispatch, useCallback, useContext, useEffect } from 'react';
import { LocalAction, songInfoFetched, stateSet } from '../actions';
import { DispatchContext } from '../context/state';
import { NullSong, Song, songExists } from '../types';
import { getApiUrl } from '../utils/url';

import { useRequestCallback } from './request';

function useNextOrPrevSong(
  key: 'next' | 'prev',
  dispatch: Dispatch<LocalAction>,
): [(songId: number) => void, boolean] {
  const sendRequest = useCallback(
    (axios: AxiosInstance, id: number): Promise<AxiosResponse<Song | NullSong>> =>
      axios.get(`${getApiUrl()}/${key}-song?id=${id}`),
    [key],
  );

  const [onRequest, response, loading] = useRequestCallback<number, Song | NullSong>({
    sendRequest,
  });

  useEffect(() => {
    if (response) {
      if (songExists(response)) {
        dispatch(songInfoFetched(response, true));
      } else {
        dispatch(stateSet({ songId: null, playing: false, seekTime: -1 }));
      }
    }
  }, [dispatch, response]);

  const debouncedRequest = useThrottleCallback(onRequest, 5, true);

  return [debouncedRequest, loading];
}

export function usePlayQueue(): {
  onNext: (songId: number) => void;
  onPrev: (songId: number) => void;
  loading: boolean;
} {
  const dispatch = useContext(DispatchContext);

  const [onRequestNext, loadingNext] = useNextOrPrevSong('next', dispatch);
  const [onRequestPrev, loadingPrev] = useNextOrPrevSong('prev', dispatch);

  return { onNext: onRequestNext, onPrev: onRequestPrev, loading: loadingNext || loadingPrev };
}
