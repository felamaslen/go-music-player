import React, { useContext, useEffect, useRef } from 'react';
import { useReducer } from 'reinspect';

import { DispatchContext } from '../../../context/state';
import { useVimBindings } from '../../../hooks/vim';
import { init } from '../../../utils/state';

import { UIProviderComponent } from '../types';

import {
  CmusUIDispatchContext,
  cmusUIReducer,
  CmusUIStateContext,
  initialCmusUIState,
} from './reducer';
import { Overlay, View } from './types';
import { useLibrary } from './utils/library';
import { ViewClientList } from './views/clients';
import { CommandView } from './views/command';
import { HelpDialog } from './views/help';
import { ViewLibrary } from './views/library';
import { ViewQueue } from './views/queue';
import { PlayerStatus } from './views/status';

import * as Styled from './wrapper.styles';

const viewTitles = Object.values(View);

export const CmusUIProvider: UIProviderComponent = ({ currentSong, nextSong, prevSong }) => {
  const dispatch = useContext(DispatchContext);
  const [stateUI, dispatchUI] = useReducer(cmusUIReducer, initialCmusUIState, init, 'ui');

  useEffect(() => {
    if (stateUI.globalAction) {
      dispatch(stateUI.globalAction);
    }
  }, [dispatch, stateUI.globalAction, stateUI.globalActionSerialNumber]);

  const lastSkipSerialNumber = useRef<number>(0);
  useEffect(() => {
    if (lastSkipSerialNumber.current !== stateUI.skipSong.serialNumber) {
      lastSkipSerialNumber.current = stateUI.skipSong.serialNumber;

      if (stateUI.skipSong.delta === 1) {
        nextSong();
      } else if (stateUI.skipSong.delta === -1) {
        prevSong();
      }
    }
  }, [stateUI.skipSong, nextSong, prevSong]);

  useVimBindings(dispatchUI, stateUI.commandMode);

  useLibrary(stateUI, dispatchUI);

  const showOverlay = !!stateUI.overlay || stateUI.view === View.ClientList;

  return (
    <CmusUIStateContext.Provider value={stateUI}>
      <CmusUIDispatchContext.Provider value={dispatchUI}>
        <Styled.Wrapper>
          <Styled.ViewTitle>
            gmus -{' '}
            {viewTitles.map((view, index) => (
              <Styled.ViewTitleItem key={view} active={view === stateUI.view}>
                ({index + 1}) {view}
              </Styled.ViewTitleItem>
            ))}
          </Styled.ViewTitle>
          <Styled.View>
            {(stateUI.view === View.Library || stateUI.view === View.ClientList) && (
              <ViewLibrary currentArtist={currentSong?.artist ?? null} />
            )}
            {stateUI.view === View.Queue && <ViewQueue currentSong={currentSong} />}
          </Styled.View>
          {showOverlay && (
            <Styled.Overlay>
              {!stateUI.overlay && stateUI.view === View.ClientList && <ViewClientList />}
              {stateUI.overlay === Overlay.Help && <HelpDialog />}
            </Styled.Overlay>
          )}
          <PlayerStatus song={currentSong} />
          <CommandView />
        </Styled.Wrapper>
      </CmusUIDispatchContext.Provider>
    </CmusUIStateContext.Provider>
  );
};
