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
import { PlayerStatus } from './status';

import * as Styled from './styles';
import { CmusUIState, View } from './types';
import { ViewLibrary } from './views/library';

export const CmusUIProvider: UIProviderComponent = () => {
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

  useVimBindings(dispatchUI);

  return (
    <CmusUIStateContext.Provider value={stateUI}>
      <CmusUIDispatchContext.Provider value={dispatchUI}>
        <Styled.Wrapper>
          <Styled.View>{stateUI.view === View.Library && <ViewLibrary />}</Styled.View>
          <PlayerStatus />
        </Styled.Wrapper>
      </CmusUIDispatchContext.Provider>
    </CmusUIStateContext.Provider>
  );
};
