import { AxiosInstance, AxiosResponse } from 'axios';
import React, { useCallback, useContext, useEffect, useMemo } from 'react';

import { StateContext } from '../../../../context/state';
import { useRequestCallback } from '../../../../hooks/request';
import { Song } from '../../../../types';
import { getApiUrl } from '../../../../utils/url';
import { queueInfoLoaded } from '../actions';
import { CmusUIDispatchContext, CmusUIStateContext } from '../reducer';

import * as Styled from './queue.styles';

export type Props = {
  currentSong: Song | null;
};

export const ViewQueue: React.FC<Props> = ({ currentSong }) => {
  const {
    player: { queue },
  } = useContext(StateContext);

  const dispatchUI = useContext(CmusUIDispatchContext);
  const {
    queue: { active },
  } = useContext(CmusUIStateContext);

  const sendRequest = useCallback(
    (axios: AxiosInstance, query: number[]): Promise<AxiosResponse<Song[]>> =>
      axios.get(`${getApiUrl()}/multi-song-info?${query.map((id) => `ids=${id}`).join('&')}`),
    [],
  );

  const [fetchQueueInfo, queueInfo] = useRequestCallback<number[], Song[]>({
    sendRequest,
  });

  useEffect(() => {
    fetchQueueInfo(queue);
  }, [fetchQueueInfo, queue]);

  const orderedSongInfo = useMemo<Song[]>(
    () =>
      queue
        .map((id) => queueInfo?.find((compare) => compare.id === id))
        .filter((info: Song | undefined): info is Song => !!info),
    [queueInfo, queue],
  );

  useEffect(() => {
    dispatchUI(queueInfoLoaded(orderedSongInfo));
  }, [dispatchUI, orderedSongInfo]);

  return (
    <Styled.Container>
      {orderedSongInfo.map((song) => (
        <Styled.QueueSong
          key={song.id}
          active={active === song.id}
          parentActive={true}
          highlight={currentSong?.id === song.id}
        >
          <Styled.Track>{song.track}</Styled.Track>
          <Styled.Title>{song.title}</Styled.Title>
          <Styled.Artist>{song.artist}</Styled.Artist>
          <Styled.Album>{song.album}</Styled.Album>
        </Styled.QueueSong>
      ))}
    </Styled.Container>
  );
};
