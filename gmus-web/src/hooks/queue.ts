import { useThrottleCallback } from '@react-hook/throttle';
import { AxiosInstance, AxiosResponse } from 'axios';
import { Dispatch, useCallback, useContext, useEffect } from 'react';
import { LocalAction, queueShifted, songInfoFetched, stateSet } from '../actions';
import { DispatchContext, StateContext } from '../context/state';
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
  onNext: () => void;
  onPrev: () => void;
  loading: boolean;
} {
  const dispatch = useContext(DispatchContext);
  const {
    player: { queue, songId },
  } = useContext(StateContext);

  const [onRequestNext, loadingNext] = useNextOrPrevSong('next', dispatch);
  const [onRequestPrev, loadingPrev] = useNextOrPrevSong('prev', dispatch);

  const loading = loadingNext || loadingPrev;

  const firstQueuedSongId = queue[0];
  const onNext = useCallback(() => {
    if (firstQueuedSongId) {
      dispatch(queueShifted());
    } else if (!loading && songId) {
      onRequestNext(songId);
    }
  }, [dispatch, firstQueuedSongId, songId, loading, onRequestNext]);

  const onPrev = useCallback(() => {
    if (!loading && songId) {
      onRequestPrev(songId);
    }
  }, [songId, loading, onRequestPrev]);

  return { onNext, onPrev, loading };
}
