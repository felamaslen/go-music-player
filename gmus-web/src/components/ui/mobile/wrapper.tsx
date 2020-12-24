import React, { useCallback, useContext } from 'react';
import { playPaused, seeked } from '../../../actions';

import { DispatchContext, StateContext } from '../../../context/state';
import { Logo } from '../../logo';
import { UIProviderComponent } from '../types';
import { Buttons } from './buttons';
import { ClientList } from './clients';
import { SongInfo } from './info';

import * as Styled from './wrapper.styles';

export const MobileUIProvider: UIProviderComponent = ({ prevSong, nextSong, currentSong }) => {
  const dispatch = useContext(DispatchContext);
  const state = useContext(StateContext);

  const onPlayPause = useCallback(() => dispatch(playPaused()), [dispatch]);
  const onSeek = useCallback((time: number) => dispatch(seeked(time)), [dispatch]);

  return (
    <Styled.Container>
      <Logo size={128} />
      <SongInfo song={currentSong} player={state.player} onSeek={onSeek} />
      <ClientList />
      <Buttons
        playing={state.player.playing}
        onPrev={prevSong}
        onPlayPause={onPlayPause}
        onNext={nextSong}
      />
    </Styled.Container>
  );
};
