import React, { useContext } from 'react';
import { StateContext } from '../../../../context/state';

import { MusicPlayer, Song } from '../../../../types';
import { formatTime } from '../../../../utils/time';

import * as Styled from './status.styles';

export type Props = {
  song: Song | null;
};

function getTrackMetadata(song: Song | null): string {
  if (!song) {
    return '';
  }
  return `${song.artist} - ${song.album} - ${song.track ? `${song.track}. ` : ''}${song.title}`;
}

function getPlayPauseIcon(player: MusicPlayer): string {
  if (!player.songId) {
    return '.';
  }
  if (player.playing) {
    return '>';
  }
  return '|';
}

export const PlayerStatus: React.FC<Props> = ({ song }) => {
  const state = useContext(StateContext);
  return (
    <Styled.StatusContainer>
      <Styled.TrackMetadata>{getTrackMetadata(song)}</Styled.TrackMetadata>
      <Styled.PlayStatus>
        <span>{getPlayPauseIcon(state.player)}</span>
        <span>
          {formatTime(state.player.currentTime)} / {formatTime(song?.time ?? null)}
        </span>
      </Styled.PlayStatus>
    </Styled.StatusContainer>
  );
};
