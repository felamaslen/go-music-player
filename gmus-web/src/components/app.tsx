import React, {
  Suspense,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useMediaQuery } from 'react-responsive';
import { StateInspector } from 'reinspect';

import { stateSet } from '../actions';
import { DispatchContext, StateContext } from '../context/state';
import { usePlayQueue } from '../hooks/queue';
import { useKeepalive } from '../hooks/socket';
import { useCurrentlyPlayingSongInfo } from '../hooks/status';
import { isActiveClient, isMaster } from '../selectors';
import { getSongUrl } from '../utils/url';
import { LoadingWrapper } from './identify';
import { Interact, Props as InteractProps } from './interact';
import { Player } from './player';
import { uiProviders } from './ui';
import { UIProps, UIProvider } from './ui/types';

export type Props = {
  socket: WebSocket | null;
  interacted: boolean;
} & InteractProps &
  Pick<UIProps, 'connecting' | 'ready' | 'error'>;

export const App: React.FC<Props> = ({
  socket,
  connecting,
  ready,
  error,
  interacted,
  setInteracted,
}) => {
  useKeepalive(socket);
  useCurrentlyPlayingSongInfo();

  const state = useContext(StateContext);
  const dispatch = useContext(DispatchContext);

  const onTimeUpdate = useCallback(
    (currentTime: number): void => {
      dispatch(stateSet({ currentTime }));
    },
    [dispatch],
  );

  const { onNext, onPrev } = usePlayQueue(state.player.shuffleMode);

  const isDesktop = useMediaQuery({ query: '(min-device-width: 1280px)' });

  const UI = useMemo(() => uiProviders[isDesktop ? UIProvider.Cmus : UIProvider.Mobile], [
    isDesktop,
  ]);

  const shouldLoadAudio = isActiveClient(state) && !!state.player.songId;
  const didLoadAudio = useRef<boolean>(false);
  const [seekTime, setSeekTime] = useState<number>(-1);
  useEffect(() => {
    if (shouldLoadAudio && !didLoadAudio.current) {
      didLoadAudio.current = true;
      setSeekTime(state.player.seekTime === -1 ? state.player.currentTime : state.player.seekTime);
    } else if (!shouldLoadAudio && didLoadAudio.current) {
      didLoadAudio.current = false;
    }
  }, [shouldLoadAudio, state.player.currentTime, state.player.seekTime]);

  return (
    <>
      {shouldLoadAudio && (
        <Player
          src={getSongUrl(state.player.songId as number)}
          playing={state.player.playing}
          seekTime={seekTime}
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
              connecting={connecting}
              ready={ready}
              error={error}
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
