import { rem } from 'polished';
import React, { useCallback, useRef } from 'react';
import styled from 'styled-components';

import { MusicPlayer, Song } from '../../../types';
import { formatTime } from '../../../utils/time';

export type Props = {
  song: Song | null;
  player: MusicPlayer;
  onSeek: (time: number) => void;
};

const Wrapper = styled.div`
  width: 100%;
`;

const Container = styled.div`
  align-items: center;
  background: #e9fff3;
  border-radius: ${rem(4)};
  box-sizing: border-box;
  display: flex;
  flex-flow: column;
  justify-content: center;
  margin: ${rem(8)} ${rem(16)};
  padding: ${rem(8)} 0 0 0;
`;

const Title = styled.span`
  font-weight: bold;
  margin-bottom: ${rem(4)};
`;

const Meta = styled.span`
  box-sizing: border-box;
  padding: 0 ${rem(4)};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  width: 100%;
`;
const Artist = styled.span``;
const Album = styled.span``;

const Dash = styled.span`
  margin: 0 ${rem(8)};
`;

const Seeker = styled.div`
  background: rgba(0, 0, 0, 0.5);
  color: white;
  display: flex;
  flex: 0 0 ${rem(16)};
  margin-top: ${rem(8)};
  width: 100%;
`;

const Time = styled.span`
  align-items: center;
  display: flex;
  flex: 0 0 auto;
  font-size: ${rem(12)};
  height: 100%;
  padding: 0 ${rem(8)};
`;

const TotalTime = styled(Time)`
  text-align: right;
`;

const Gutter = styled.div`
  display: flex;
  flex: 1;
  height: ${rem(16)};
`;

const Progress = styled.div`
  align-items: flex-end;
  display: flex;
  justify-content: flex-end;
  height: 100%;
`;

const PlayHead = styled.span`
  background: white;
  flex: 0 0 ${rem(2)};
  height: 100%;
`;

export const SongInfo: React.FC<Props> = ({ song, player, onSeek }) => {
  const gutter = useRef<HTMLDivElement>(null);
  const seekToTouch = useCallback(
    (event: React.TouchEvent) => {
      if (!(gutter.current && song?.time && event.changedTouches.length)) {
        return;
      }
      const fraction =
        (event.changedTouches[0].pageX - gutter.current.offsetLeft) / gutter.current.offsetWidth;
      onSeek(song.time * fraction);
    },
    [onSeek, song?.time],
  );

  return (
    <Wrapper>
      <Container>
        {song && (
          <>
            <Title>
              {song.track ? `${song.track} - ` : ''}
              {song.title}
            </Title>
            <Meta>
              <Artist>{song.artist || 'Unknown Artist'}</Artist>
              <Dash>-</Dash>
              <Album>{song.album || 'Unknown Album'}</Album>
            </Meta>
            <Seeker>
              <Time>{formatTime(player.currentTime)}</Time>
              <Gutter ref={gutter} onTouchEnd={seekToTouch}>
                <Progress style={{ flexBasis: `${(100 * player.currentTime) / song.time}%` }}>
                  <PlayHead />
                </Progress>
              </Gutter>
              <TotalTime>{formatTime(song.time)}</TotalTime>
            </Seeker>
          </>
        )}
        {!song && <Dash>-</Dash>}
      </Container>
    </Wrapper>
  );
};
