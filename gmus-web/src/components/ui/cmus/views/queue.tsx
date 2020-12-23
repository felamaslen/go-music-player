import { AxiosInstance, AxiosResponse } from 'axios';
import React, { CSSProperties, useCallback, useContext, useEffect, useMemo, useRef } from 'react';
import AutoSizer from 'react-virtualized-auto-sizer';
import { FixedSizeList as List } from 'react-window';

import { StateContext } from '../../../../context/state';
import { useRequestCallback } from '../../../../hooks/request';
import { Song } from '../../../../types';
import { namedMemo } from '../../../../utils/component';
import { getApiUrl } from '../../../../utils/url';
import { queueInfoLoaded } from '../actions';
import { CmusUIDispatchContext, CmusUIStateContext } from '../reducer';
import { lineHeight, useAutoJumpyScroll } from '../utils/scroll';

import * as Styled from './queue.styles';
import { SongData } from './songs';

export type Props = {
  currentSong: Song | null;
};

type QueueInfoData = Omit<SongData, 'parentActive' | 'queuePosition'>;

const itemKey = (index: number, data: QueueInfoData[]): number => data[index].song.id;

const Row = namedMemo<{ index: number; data: QueueInfoData[]; style: CSSProperties }>(
  'QueueInfo',
  ({ index, data, style }) => (
    <Styled.QueueSong
      active={data[index].active}
      parentActive={true}
      highlight={data[index].highlight}
      style={style}
    >
      <Styled.Track>{data[index].song.track}</Styled.Track>
      <Styled.Title>{data[index].song.title}</Styled.Title>
      <Styled.Artist>{data[index].song.artist}</Styled.Artist>
      <Styled.Album>{data[index].song.album}</Styled.Album>
    </Styled.QueueSong>
  ),
);

export const ViewQueue: React.FC<Props> = ({ currentSong }) => {
  const globalState = useContext(StateContext);

  const dispatchUI = useContext(CmusUIDispatchContext);
  const state = useContext(CmusUIStateContext);

  const sendRequest = useCallback(
    (axios: AxiosInstance, query: number[]): Promise<AxiosResponse<Song[]>> =>
      axios.get(`${getApiUrl()}/multi-song-info?${query.map((id) => `ids=${id}`).join('&')}`),
    [],
  );

  const [fetchQueueInfo, queueInfo] = useRequestCallback<number[], Song[]>({
    sendRequest,
  });

  const orderedSongInfo = useMemo<Song[]>(
    () =>
      globalState.player.queue
        .map((id) => queueInfo?.find((compare) => compare.id === id))
        .filter((info: Song | undefined): info is Song => !!info),
    [globalState.player.queue, queueInfo],
  );

  const itemData = useMemo<QueueInfoData[]>(
    () =>
      orderedSongInfo.map<QueueInfoData>((info) => ({
        song: info,
        active: state.queue.active === info.id,
        highlight: currentSong?.id === info.id,
      })),
    [orderedSongInfo, state.queue.active, currentSong?.id],
  );

  useEffect(() => {
    if (globalState.player.queue.length) {
      fetchQueueInfo(globalState.player.queue);
    }
  }, [fetchQueueInfo, globalState.player.queue]);

  useEffect(() => {
    dispatchUI(queueInfoLoaded(orderedSongInfo));
  }, [dispatchUI, orderedSongInfo]);

  const windowRef = useRef<HTMLDivElement>(null);
  useAutoJumpyScroll(
    windowRef,
    state.queue.active === null
      ? -1
      : orderedSongInfo.findIndex(({ id }) => id === state.queue.active),
  );

  return (
    <Styled.Container>
      <AutoSizer>
        {({ height, width }): React.ReactElement => (
          <List
            outerRef={windowRef}
            height={height}
            width={width}
            itemCount={itemData.length}
            itemSize={lineHeight}
            itemKey={itemKey}
            itemData={itemData}
          >
            {Row}
          </List>
        )}
      </AutoSizer>
    </Styled.Container>
  );
};
