import { Dispatch, Reducer, useCallback, useEffect, useReducer } from 'react';

import { AnyAction } from '../actions';
import { globalEffects } from '../effects';

import { composedGlobalReducer, GlobalState, initialState } from '../reducer';

function init(state: GlobalState): GlobalState {
  return state;
}

export function useGlobalState(socket: WebSocket): [GlobalState, Dispatch<AnyAction>] {
  const [state, dispatch] = useReducer<Reducer<GlobalState, AnyAction>, GlobalState>(
    composedGlobalReducer,
    initialState,
    init,
  );

  const onMessage = useCallback(({ data }: { data: string }): void => {
    try {
      const action = JSON.parse(data) as AnyAction;
      dispatch(action);
    } catch (err) {
      console.warn('Error parsing message from websocket', err.message);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line no-param-reassign
    socket.onmessage = onMessage;
  }, [socket, onMessage]);

  useEffect(() => {
    const remoteEffect = globalEffects(state.lastAction);
    if (remoteEffect) {
      socket.send(JSON.stringify(remoteEffect));
    }
  }, [socket, state.lastAction]);

  return [state, dispatch];
}
