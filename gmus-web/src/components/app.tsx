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
import { Interact, Props as InteractProps } from './interact';
import { Player } from './player';
import { uiProviders } from './ui';
import { UIProvider } from './ui/types';

export type Props = {
  socket: WebSocket;
  interacted: boolean;
} & InteractProps;

const uiProvider = UIProvider.Cmus;
const UI = uiProviders[uiProvider];

export const App: React.FC<Props> = ({ socket, interacted, setInteracted }) => {
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

  const { onNext, onPrev } = usePlayQueue();

  return (
    <>
      {isMaster(state) && !!state.player.songId && (
        <Player
          src={getSongUrl(state.player.songId)}
          playing={state.player.playing}
          seekTime={state.player.seekTime}
          onTimeUpdate={onTimeUpdate}
          timeUpdateFPS={1}
          onEnded={onNext}
        />
      )}
      <StateInspector name="ui">
        {!interacted && <Interact setInteracted={setInteracted} />}
        {interacted && (
          <Suspense fallback={<LoadingWrapper />}>
            <UI
              isMaster={isMaster(state)}
              currentSong={state.songInfo}
              nextSong={onNext}
              prevSong={onPrev}
            />
          </Suspense>
        )}
      </StateInspector>
    </>
  );
};
