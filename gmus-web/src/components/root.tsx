import React, { Reducer, useCallback, useReducer } from 'react';

import { AnyAction, nameSet } from '../actions';
import { useDispatchWithEffects, useOnMessage, useSocket } from '../hooks/socket';
import { globalReducer, GlobalState, initialState } from '../reducer';
import { init } from '../utils/state';
import { App } from './app';
import { Identify } from './identify';

export const Root: React.FC = () => {
  const [state, dispatch] = useReducer<Reducer<GlobalState, AnyAction>, GlobalState>(
    globalReducer,
    initialState,
    init,
  );

  const onMessage = useOnMessage(dispatch);

  const onLogin = useCallback(
    (name: string): void => {
      dispatch(nameSet(name));
    },
    [dispatch],
  );

  const { name, onIdentify, socket, connecting, connected, error } = useSocket(onMessage, onLogin);

  const dispatchWithEffects = useDispatchWithEffects(state, dispatch, socket);

  if (!(socket && connected && name) || error) {
    return <Identify connecting={connecting} onIdentify={onIdentify} />;
  }

  return <App socket={socket} state={state} dispatch={dispatchWithEffects} />;
};
