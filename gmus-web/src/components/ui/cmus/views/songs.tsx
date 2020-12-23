import groupBy from 'lodash/groupBy';
import React, { CSSProperties, useCallback, useContext, useMemo, useRef } from 'react';
import AutoSizer from 'react-virtualized-auto-sizer';
import { VariableSizeList as List } from 'react-window';
import { StateContext } from '../../../../context/state';

import { Song } from '../../../../types';
import { namedMemo } from '../../../../utils/component';
import { CmusUIStateContext } from '../reducer';
import { getFilteredSongs } from '../selectors';
import { NoWrapFill } from '../styled/layout';
import { AsciiSpinner } from '../styled/spinner';
import { getSongScrollIndex, lineHeight, useAutoJumpyScroll } from '../utils/scroll';

import * as Styled from './songs.styles';

type Props = {
  active: boolean;
};

export type SongData = {
  song: Song;
  active: boolean;
  parentActive: boolean;
  highlight: boolean;
  queuePosition: number;
};

type Separator = {
  album: string;
};

type ItemData = (SongData | Separator) & { id: number };

const isSeparator = (item: ItemData | Separator): item is Separator => !Reflect.has(item, 'song');

const itemKey = (index: number, data: ItemData[]): number => data[index].id;

const queueSymbols = [
  '⑴',
  '⑵',
  '⑶',
  '⑷',
  '⑸',
  '⑹',
  '⑺',
  '⑻',
  '⑼',
  '⑽',
  '⑾',
  '⑿',
  '⒀',
  '⒁',
  '⒂',
  '⒃',
  '⒄',
  '⒅',
  '⒆',
  '⒇',
];

const Row = namedMemo<{ index: number; data: ItemData[]; style: CSSProperties }>(
  'Song',
  ({ index, data, style }) => {
    const item = data[index];
    if (isSeparator(item)) {
      return (
        <Styled.Separator style={style}>
          <Styled.SeparatorText>{item.album || 'Unknown Album'}</Styled.SeparatorText>
        </Styled.Separator>
      );
    }
    const { song, active, parentActive, highlight, queuePosition } = item;
    return (
      <Styled.Song active={active} parentActive={parentActive} style={style} highlight={highlight}>
        <Styled.QueuePosition invert={active && !parentActive}>
          {queuePosition >= 0 && queuePosition < queueSymbols.length
            ? queueSymbols[queuePosition]
            : ''}
        </Styled.QueuePosition>
        <NoWrapFill>
          {song.track ? `${song.track} - ` : ''}
          {song.title || 'Untitled Track'}
        </NoWrapFill>
      </Styled.Song>
    );
  },
);

export const Songs: React.FC<Props> = ({ active: parentActive }) => {
  const globalState = useContext(StateContext);
  const { songId: playingSongId, queue } = globalState.player;

  const state = useContext(CmusUIStateContext);
  const { activeArtist, activeAlbum, activeSongId } = state.library;

  const filteredSongs = getFilteredSongs(state);

  const itemData = useMemo<ItemData[]>(() => {
    const allSongs = filteredSongs.map<SongData & { id: number }>((song) => ({
      id: song.id,
      song,
      active: song.id === activeSongId,
      parentActive,
      highlight: song.id === playingSongId,
      queuePosition: queue.indexOf(song.id),
    }));

    if (activeAlbum !== null) {
      return allSongs;
    }

    return Object.entries(groupBy(allSongs, ({ song }) => song.album)).reduce<ItemData[]>(
      (last, [album, group], index) => [...last, { id: -index, album }, ...group],
      [],
    );
  }, [parentActive, activeSongId, playingSongId, filteredSongs, activeAlbum, queue]);

  const getItemSize = useCallback(
    (index: number): number => lineHeight * (isSeparator(itemData[index]) ? 2 : 1),
    [itemData],
  );

  const windowRef = useRef<HTMLDivElement>(null);
  const scrollIndex = getSongScrollIndex(filteredSongs, activeSongId);

  useAutoJumpyScroll(windowRef, scrollIndex);

  if (activeArtist !== null && !(activeArtist in state.artistSongs)) {
    return (
      <Styled.Container>
        <AsciiSpinner />
      </Styled.Container>
    );
  }

  return (
    <Styled.Container>
      <AutoSizer>
        {({ height, width }): React.ReactElement => (
          <List
            key={`${activeArtist}-${activeAlbum}`}
            outerRef={windowRef}
            height={height}
            width={width}
            itemCount={itemData.length}
            itemSize={getItemSize}
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
