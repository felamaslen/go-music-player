import { useThrottleCallback } from '@react-hook/throttle';
import React, { Dispatch, useCallback, useEffect, useRef, useState } from 'react';

import { AnyAction, stateSet } from '../../actions';
import { masterStateUpdateTimeout } from '../../constants/system';
import { useDispatchEffects, useKeepalive } from '../../hooks/socket';
import { GlobalState } from '../../reducer/types';
import { ClientList } from '../client-list';
import { Player } from '../player';

export type Props = {
  socket: WebSocket;
  state: GlobalState;
  dispatch: Dispatch<AnyAction>;
};

function useMaster(dispatch: Dispatch<AnyAction>, isMaster: boolean): void {
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
  useDispatchEffects(socket, state);

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
        master: myClientName,
      }),
    );
  }, [dispatch, tempSongId, myClientName]);

  const playPause = useCallback(() => {
    dispatch(stateSet({ playing: !player.playing }));
  }, [dispatch, player.playing]);

  const onTimeUpdate = useCallback(
    (currentTime: number): void => {
      if (isMaster) {
        dispatch(stateSet({ currentTime }));
      }
    },
    [dispatch, isMaster],
  );
  const onTimeUpdateThrottled = useThrottleCallback(onTimeUpdate, 1000);

  return (
    <div>
      <div>
        <button onClick={playPause}>{player.playing ? 'Pause' : 'Play'}</button>
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
      <ClientList myClientName={myClientName} clients={clientList} />
      <div>
        <h6>Player State</h6>
        <pre>{JSON.stringify(player, null, 2)}</pre>
      </div>
      {isMaster && !!player.songId && (
        <Player
          playing={player.playing}
          onTimeUpdate={onTimeUpdateThrottled}
          songId={player.songId}
        />
      )}
    </div>
  );
};
