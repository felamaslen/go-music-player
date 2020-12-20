import React, { Suspense, useCallback, useContext } from 'react';
import { StateInspector } from 'reinspect';

import { stateSet } from '../actions';
import { DispatchContext, StateContext } from '../context/state';
import { useMaster } from '../hooks/master';
import { usePlayQueue } from '../hooks/queue';
import { useKeepalive } from '../hooks/socket';
import { useCurrentlyPlayingSongInfo } from '../hooks/status';
import { isMaster } from '../selectors';
import { getSongUrl } from '../utils/url';
import { LoadingWrapper } from './identify';
import { Player } from './player';
import { uiProviders } from './ui';
import { UIProvider } from './ui/types';

export type Props = {
  socket: WebSocket;
};

const uiProvider = UIProvider.Cmus;
const UI = uiProviders[uiProvider];

export const App: React.FC<Props> = ({ socket }) => {
  useKeepalive(socket);
  useMaster();
  useCurrentlyPlayingSongInfo();

  const state = useContext(StateContext);
  const dispatch = useContext(DispatchContext);

  const onTimeUpdate = useCallback(
    (currentTime: number): void => {
      dispatch(stateSet({ currentTime }));
    },
    [dispatch],
  );

  const { onNext, onPrev, loading: loadingQueue } = usePlayQueue();
  const onEnded = useCallback(() => {
    if (state.player.songId) {
      onNext(state.player.songId);
    }
  }, [onNext, state.player.songId]);

  const nextSong = useCallback(() => {
    if (loadingQueue || !state.player.songId) {
      return;
    }
    onNext(state.player.songId);
  }, [loadingQueue, onNext, state.player.songId]);

  const prevSong = useCallback(() => {
    if (loadingQueue || !state.player.songId) {
      return;
    }
    onPrev(state.player.songId);
  }, [loadingQueue, onPrev, state.player.songId]);

  return (
    <>
      {isMaster(state) && !!state.player.songId && (
        <Player
          src={getSongUrl(state.player.songId)}
          playing={state.player.playing}
          seekTime={state.player.seekTime}
          onTimeUpdate={onTimeUpdate}
          timeUpdateFPS={1}
          onEnded={onEnded}
        />
      )}
      <StateInspector name="ui">
        <Suspense fallback={<LoadingWrapper />}>
          <UI
            isMaster={isMaster(state)}
            currentSong={state.songInfo}
            nextSong={nextSong}
            prevSong={prevSong}
          />
        </Suspense>
      </StateInspector>
    </>
  );
};
