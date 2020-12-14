import React, { useCallback, useState } from 'react';

import { stateSet } from '../../actions';
import { useKeepalive } from '../../hooks/socket';
import { useGlobalState } from '../../hooks/state';
import { ClientList } from '../client-list';

export type Props = {
  myClientName: string;
  socket: WebSocket;
};

export const Gmus: React.FC<Props> = ({ myClientName, socket }) => {
  useKeepalive(socket);

  const [{ clientList, player }, dispatch] = useGlobalState(socket);

  const [tempSongId, setTempSongId] = useState<number>(0);

  const playSong = useCallback((): void => {
    if (!tempSongId) {
      return;
    }

    dispatch(
      stateSet({
        songId: tempSongId,
        playTimeSeconds: 0,
        playing: true,
        currentClient: myClientName,
      }),
    );
  }, [dispatch, tempSongId, myClientName]);

  const playPause = useCallback(() => {
    dispatch(
      stateSet({
        ...player,
        playing: !player.playing,
      }),
    );
  }, [dispatch, player]);

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
      <ClientList clients={clientList} />
      <div>
        <h6>Player State</h6>
        <pre>{JSON.stringify(player, null, 2)}</pre>
      </div>
    </div>
  );
};
