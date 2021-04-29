import React, { useContext } from 'react';
import { StateContext } from '../../../../context/state';
import { isActiveClient, isMaster } from '../../../../selectors';

import { MusicPlayer, Song } from '../../../../types';
import { formatTime } from '../../../../utils/time';
import { AsciiSpinner } from '../styled/spinner';

import * as Styled from './status.styles';

export type Props = {
  song: Song | null;
  connecting?: boolean;
  ready?: boolean;
  error?: boolean;
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

const StatusIcon: React.FC<Omit<Props, 'song'>> = ({
  connecting = false,
  ready = false,
  error = false,
}) => {
  if (connecting) {
    return <AsciiSpinner />;
  }
  if (error || !ready) {
    return <span>!&nbsp;</span>;
  }
  return <span>✓&nbsp;</span>;
};

export const PlayerStatus: React.FC<Props> = ({ song, ...props }) => {
  const state = useContext(StateContext);
  return (
    <Styled.StatusContainer>
      <Styled.TrackMetadata>{getTrackMetadata(song)}</Styled.TrackMetadata>
      <Styled.PlayStatus>
        <Styled.Time>
          <span>{getPlayPauseIcon(state.player)}</span>
          <span>
            {formatTime(state.player.currentTime)} / {formatTime(song?.time ?? null)}
          </span>
        </Styled.Time>
        <Styled.ClientName>
          {state.myClientName} [{isMaster(state) ? 'Master' : 'Slave'}]
          {isActiveClient(state) ? '🔊' : '🔈'}
        </Styled.ClientName>
        &nbsp;
        {state.player.shuffleMode ? 'S' : ' '}
        &nbsp;
        <StatusIcon {...props} />
      </Styled.PlayStatus>
    </Styled.StatusContainer>
  );
};
