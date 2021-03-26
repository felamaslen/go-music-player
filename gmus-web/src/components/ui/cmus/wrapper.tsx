import React, { useContext, useEffect, useRef } from 'react';
import { useReducer } from 'reinspect';

import { DispatchContext } from '../../../context/state';
import { useMaster } from '../../../hooks/master';
import { useVimBindings } from '../../../hooks/vim';
import { init } from '../../../utils/state';

import { UIProviderComponent } from '../types';

import {
  CmusUIDispatchContext,
  cmusUIReducer,
  CmusUIStateContext,
  initialCmusUIState,
} from './reducer';
import { Search } from './search';
import { Overlay, View } from './types';
import { useLibrary } from './utils/library';
import { ViewClientList } from './views/clients';
import { CommandView } from './views/command';
import { DisconnectedDialog } from './views/disconnected';
import { HelpDialog } from './views/help';
import { ViewLibrary } from './views/library';
import { ViewQueue } from './views/queue';
import { PlayerStatus } from './views/status';

import * as Styled from './wrapper.styles';

const viewTitles = Object.values(View);

export const CmusUIProvider: UIProviderComponent = ({
  connecting,
  ready,
  error,
  currentSong,
  nextSong,
  prevSong,
}) => {
  useMaster();

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

  useVimBindings(dispatchUI, !ready || stateUI.commandMode || stateUI.searchMode);

  useLibrary(stateUI, dispatchUI);

  const showOverlay = !!stateUI.overlay || stateUI.view === View.ClientList;

  const showLibrary = stateUI.view === View.Library || stateUI.view === View.ClientList;

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
            <ViewLibrary currentArtist={currentSong?.artist ?? null} hidden={!showLibrary} />
            {stateUI.view === View.Queue && <ViewQueue currentSong={currentSong} />}
          </Styled.View>
          {showOverlay && (
            <Styled.Overlay>
              {!stateUI.overlay && stateUI.view === View.ClientList && <ViewClientList />}
              {stateUI.overlay === Overlay.Help && <HelpDialog />}
            </Styled.Overlay>
          )}
          {!ready && (
            <Styled.Overlay>
              <DisconnectedDialog />
            </Styled.Overlay>
          )}
          {stateUI.searchMode && <Search />}
          <PlayerStatus song={currentSong} connecting={connecting} error={error} ready={ready} />
          <CommandView />
        </Styled.Wrapper>
      </CmusUIDispatchContext.Provider>
    </CmusUIStateContext.Provider>
  );
};
