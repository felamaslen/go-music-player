import React, { Dispatch, Suspense, useCallback } from 'react';

import { LocalAction, stateSet } from '../actions';
import { DispatchContext, StateContext } from '../context/state';
import { useMaster } from '../hooks/master';
import { useKeepalive } from '../hooks/socket';
import { useCurrentlyPlayingSongInfo } from '../hooks/status';
import { GlobalState } from '../reducer';
import { isMaster } from '../selectors';
import { getSongUrl } from '../utils/url';
import { LoadingWrapper } from './identify';
import { Player } from './player';
import { uiProviders } from './ui';
import { UIProvider } from './ui/types';

export type Props = {
  socket: WebSocket;
  state: GlobalState;
  dispatch: Dispatch<LocalAction>;
};

const uiProvider = UIProvider.Cmus;
const UI = uiProviders[uiProvider];

export const App: React.FC<Props> = ({ socket, state, dispatch }) => {
  useKeepalive(socket);
  useMaster(state, dispatch);
  const currentSong = useCurrentlyPlayingSongInfo(state.player.songId);

  const onTimeUpdate = useCallback(
    (currentTime: number): void => {
      dispatch(stateSet({ currentTime }));
    },
    [dispatch],
  );

  return (
    <>
      {isMaster(state) && !!state.player.songId && (
        <Player
          src={getSongUrl(state.player.songId)}
          playing={state.player.playing}
          seekTime={state.player.seekTime}
          onTimeUpdate={onTimeUpdate}
          timeUpdateFPS={1}
        />
      )}
      <StateContext.Provider value={state}>
        <DispatchContext.Provider value={dispatch}>
          <Suspense fallback={LoadingWrapper}>
            <UI isMaster={isMaster(state)} currentSong={currentSong} />
          </Suspense>
        </DispatchContext.Provider>
      </StateContext.Provider>
    </>
  );
};
