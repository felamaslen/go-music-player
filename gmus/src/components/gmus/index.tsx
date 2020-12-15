import React, { Dispatch, useCallback, useEffect, useRef, useState } from 'react';

import { LocalAction, seeked, stateSet } from '../../actions';
import { masterStateUpdateTimeout } from '../../constants/system';
import { useKeepalive } from '../../hooks/socket';
import { GlobalState } from '../../reducer/types';
import { getSongUrl } from '../../utils/url';
import { ClientList } from '../client-list';
import { Player } from '../player';

export type Props = {
  socket: WebSocket;
  state: GlobalState;
  dispatch: Dispatch<LocalAction>;
};

function useMaster(dispatch: Dispatch<LocalAction>, isMaster: boolean): void {
  const masterUpdateTimer = useRef<number>(0);
  useEffect(() => {
    if (isMaster) {
      masterUpdateTimer.current = window.setInterval(() => {
        dispatch(stateSet());
      }, masterStateUpdateTimeout);
    }

    return (): void => {
      window.clearInterval(masterUpdateTimer.current);
    };
  }, [dispatch, isMaster]);
}

export const Gmus: React.FC<Props> = ({ socket, state, dispatch }) => {
  useKeepalive(socket);

  const { clientList, player, myClientName } = state;

  const isMaster = player.master === myClientName;
  useMaster(dispatch, isMaster);

  const [tempSongId, setTempSongId] = useState<number>(0);

  const playSong = useCallback((): void => {
    if (!tempSongId) {
      return;
    }

    dispatch(
      stateSet({
        songId: tempSongId,
        currentTime: 0,
        playing: true,
      }),
    );
  }, [dispatch, tempSongId]);

  const playPause = useCallback(() => {
    dispatch(stateSet({ playing: !player.playing }));
  }, [dispatch, player.playing]);

  const takeControl = useCallback(() => {
    dispatch(stateSet({ master: myClientName }));
  }, [dispatch, myClientName]);

  const onTimeUpdate = useCallback(
    (currentTime: number): void => {
      dispatch(stateSet({ currentTime }));
    },
    [dispatch],
  );

  const seekTo = useCallback(
    (time: number) => {
      dispatch(seeked(time));
    },
    [dispatch],
  );

  return (
    <div>
      <div>
        <button onClick={playPause}>{player.playing ? 'Pause' : 'Play'}</button>
        {!isMaster && <button onClick={takeControl}>Take control</button>}
      </div>
      <div>
        <input
          onChange={({ target: { value } }): void => setTempSongId(Number(value))}
          type="number"
          min={0}
          step={1}
        />
        <button onClick={playSong}>Change track</button>
      </div>
      <div>
        <input
          type="number"
          onBlur={({ target: { value } }): void => seekTo(Number(value))}
          min={0}
          step={0.01}
        />
      </div>
      <ClientList myClientName={myClientName} clients={clientList} />
      <div>
        <h6>Player State</h6>
        <pre>{JSON.stringify(player, null, 2)}</pre>
      </div>
      {isMaster && !!player.songId && (
        <Player
          src={getSongUrl(player.songId)}
          playing={player.playing}
          seekTime={player.seekTime}
          onTimeUpdate={onTimeUpdate}
          timeUpdateFPS={1}
        />
      )}
    </div>
  );
};
