import { AxiosInstance, AxiosResponse } from 'axios';
import React, { useCallback, useContext, useMemo, useState } from 'react';

import { StateContext } from '../../../../context/state';
import { useCancellableRequest } from '../../../../hooks/request';
import { getSongId } from '../../../../selectors';
import { MusicPlayer, Song } from '../../../../types';
import { formatTime } from '../../../../utils/time';
import { getApiUrl } from '../../../../utils/url';

import * as Styled from './status.styles';

type SongInfoQuery = { id: number };

const sendSongInfoRequest = (
  axios: AxiosInstance,
  query: SongInfoQuery,
): Promise<AxiosResponse<Song>> => axios.get(`${getApiUrl()}/song-info?id=${query.id}`);

function getTrackMetadata(songInfo: Song | null): string {
  if (!songInfo) {
    return '';
  }
  return `${songInfo.artist} - ${songInfo.album} - ${songInfo.track ? `${songInfo.track}. ` : ''}${
    songInfo.title
  }`;
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

export const PlayerStatus: React.FC = () => {
  const state = useContext(StateContext);
  const songId = getSongId(state);

  const query = useMemo<SongInfoQuery>(() => (songId ? { id: songId } : { id: 0 }), [songId]);

  const [songInfo, setSongInfo] = useState<Song | null>(null);
  const handleResponse = useCallback((res: Song) => {
    setSongInfo(res);
  }, []);

  useCancellableRequest<SongInfoQuery, Song>({
    query,
    pause: !songId,
    sendRequest: sendSongInfoRequest,
    handleResponse,
  });

  return (
    <Styled.StatusContainer>
      <Styled.TrackMetadata>{getTrackMetadata(songInfo)}</Styled.TrackMetadata>
      <Styled.PlayStatus>
        <span>{getPlayPauseIcon(state.player)}</span>
        <span>
          {formatTime(state.player.currentTime)} / {formatTime(songInfo?.time ?? null)}
        </span>
      </Styled.PlayStatus>
    </Styled.StatusContainer>
  );
};
