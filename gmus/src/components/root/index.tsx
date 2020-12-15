import React, { Reducer, useCallback, useReducer } from 'react';
import { AnyAction, nameSet } from '../../actions';

import { useOnMessage, useSocket } from '../../hooks/socket';
import { composedGlobalReducer, GlobalState, init, initialState } from '../../reducer';
import { Gmus } from '../gmus';
import { Identify } from '../identify';

export const Root: React.FC = () => {
  const [state, dispatch] = useReducer<Reducer<GlobalState, AnyAction>, GlobalState>(
    composedGlobalReducer,
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

  if (!(socket && connected && name) || error) {
    return <Identify connecting={connecting} onIdentify={onIdentify} />;
  }

  return <Gmus socket={socket} state={state} dispatch={dispatch} />;
};
