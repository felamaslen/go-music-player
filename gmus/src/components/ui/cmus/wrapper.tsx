import React, { Reducer, useContext, useEffect, useReducer } from 'react';

import { DispatchContext } from '../../../context/state';
import { useVimBindings } from '../../../hooks/vim';

import { UIProviderComponent } from '../types';
import { CmusUIAction } from './actions';

import {
  CmusUIDispatchContext,
  cmusUIReducer,
  CmusUIStateContext,
  initialCmusUIState,
} from './reducer';
import { CmusUIState, Overlay, View } from './types';

import { CommandView } from './views/command';
import { HelpDialog } from './views/help';
import { ViewLibrary } from './views/library';
import { PlayerStatus } from './views/status';

import * as Styled from './wrapper.styles';

export const CmusUIProvider: UIProviderComponent = ({ currentSong }) => {
  const dispatch = useContext(DispatchContext);
  const [stateUI, dispatchUI] = useReducer<Reducer<CmusUIState, CmusUIAction>>(
    cmusUIReducer,
    initialCmusUIState,
  );

  useEffect(() => {
    if (stateUI.globalAction) {
      dispatch(stateUI.globalAction);
    }
  }, [dispatch, stateUI.globalAction, stateUI.globalActionSerialNumber]);

  useVimBindings(dispatchUI, stateUI.commandMode);

  return (
    <CmusUIStateContext.Provider value={stateUI}>
      <CmusUIDispatchContext.Provider value={dispatchUI}>
        <Styled.Wrapper>
          <Styled.View>
            {stateUI.view === View.Library && (
              <ViewLibrary currentArtist={currentSong?.artist ?? null} />
            )}
          </Styled.View>
          {!!stateUI.overlay && (
            <>
              <Styled.Overlay>{stateUI.overlay === Overlay.Help && <HelpDialog />}</Styled.Overlay>
            </>
          )}
          <PlayerStatus song={currentSong} />
          <CommandView />
        </Styled.Wrapper>
      </CmusUIDispatchContext.Provider>
    </CmusUIStateContext.Provider>
  );
};
