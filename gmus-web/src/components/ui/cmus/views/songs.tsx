import React, { CSSProperties, useContext, useMemo, useRef } from 'react';
import AutoSizer from 'react-virtualized-auto-sizer';
import { FixedSizeList as List } from 'react-window';
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

type SongData = {
  song: Song;
  active: boolean;
  parentActive: boolean;
  highlight: boolean;
};

const itemKey = (index: number, data: SongData[]): number => data[index].song.id;

const Row = namedMemo<{ index: number; data: SongData[]; style: CSSProperties }>(
  'Song',
  ({ index, data, style }) => {
    const { song, active, parentActive, highlight } = data[index];
    return (
      <Styled.Song active={active} parentActive={parentActive} style={style} highlight={highlight}>
        <NoWrapFill>
          {song.track} - {song.title || 'Untitled Track'}
        </NoWrapFill>
      </Styled.Song>
    );
  },
);

export const Songs: React.FC<Props> = ({ active: parentActive }) => {
  const globalState = useContext(StateContext);
  const { songId: playingSongId } = globalState.player;

  const state = useContext(CmusUIStateContext);
  const { activeArtist, activeSongId } = state.library;

  const filteredSongs = getFilteredSongs(state);

  const itemData = useMemo<SongData[]>(
    () =>
      filteredSongs.map<SongData>((song) => ({
        song,
        active: song.id === activeSongId,
        parentActive,
        highlight: song.id === playingSongId,
      })),
    [parentActive, activeSongId, playingSongId, filteredSongs],
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
