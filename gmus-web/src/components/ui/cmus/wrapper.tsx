import React, { useContext, useEffect } from 'react';
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
import { PlayerStatus } from './views/status';

import * as Styled from './wrapper.styles';

const viewTitles = Object.values(View);

export const CmusUIProvider: UIProviderComponent = ({ currentSong }) => {
  const dispatch = useContext(DispatchContext);
  const [stateUI, dispatchUI] = useReducer(cmusUIReducer, initialCmusUIState, init, 'ui');

  useEffect(() => {
    if (stateUI.globalAction) {
      dispatch(stateUI.globalAction);
    }
  }, [dispatch, stateUI.globalAction, stateUI.globalActionSerialNumber]);

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
