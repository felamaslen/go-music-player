import React, { useCallback, useState } from 'react';
import { useReducer } from 'reinspect';

import { nameSet } from '../actions';
import { DispatchContext, StateContext } from '../context/state';
import { useDispatchWithEffects, useOnMessage, useSocket } from '../hooks/socket';
import { globalReducer, initialState } from '../reducer';
import { init } from '../utils/state';
import { App } from './app';
import { Identify } from './identify';

export const Root: React.FC = () => {
  const [state, dispatch] = useReducer(globalReducer, initialState, init, 'global');

  const onMessage = useOnMessage(dispatch);

  const onLogin = useCallback(
    (name: string): void => {
      dispatch(nameSet(name));
    },
    [dispatch],
  );

  const { identified, onIdentify, ready, connecting, error, socket } = useSocket(
    onMessage,
    onLogin,
  );

  const dispatchWithEffects = useDispatchWithEffects(state, dispatch, socket);

  const [interacted, setInteracted] = useState<boolean>(false);

  if (!identified) {
    return (
      <Identify connecting={connecting} onIdentify={onIdentify} setInteracted={setInteracted} />
    );
  }

  return (
    <StateContext.Provider value={state}>
      <DispatchContext.Provider value={dispatchWithEffects}>
        <App
          socket={socket}
          connecting={connecting}
          ready={ready}
          error={error}
          interacted={interacted}
          setInteracted={setInteracted}
        />
      </DispatchContext.Provider>
    </StateContext.Provider>
  );
};
