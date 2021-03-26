import { nanoid } from 'nanoid';
import { Dispatch, useCallback, useEffect, useRef, useState } from 'react';
import { useStorageState } from 'react-storage-hooks';

import { ActionTypeLocal, AnyAction, LocalAction, RemoteAction } from '../actions';
import { errorOccurred } from '../actions/error';
import { socketKeepaliveTimeout } from '../constants/system';
import { globalEffects } from '../effects';
import { GlobalState } from '../reducer';
import { noop } from '../utils/noop';
import { getPubsubUrl } from '../utils/url';

const getUniqueName = (name: string): string => (name.length ? `${name}-${nanoid(5)}` : '');
const clientNameKey = 'client-name';

export type OnMessage = (message: MessageEvent<unknown>) => void;

export function useOnMessage(dispatch: Dispatch<AnyAction>): OnMessage {
  return useCallback<OnMessage>(
    ({ data }: MessageEvent<unknown>): void => {
      try {
        const action = JSON.parse(data as string) as RemoteAction;
        dispatch(action);
      } catch (err) {
        dispatch(errorOccurred(`Error parsing message from websocket: ${err.message}`));
      }
    },
    [dispatch],
  );
}

export function useDispatchWithEffects(
  state: GlobalState,
  dispatch: Dispatch<AnyAction>,
  socket: WebSocket | null,
): Dispatch<LocalAction> {
  const [lastAction, setLastAction] = useState<LocalAction | null>(null);

  const dispatchWithEffects = useCallback(
    (action: LocalAction): void => {
      if (action.type === ActionTypeLocal.LoggedOut) {
        socket?.close();
        localStorage.removeItem(clientNameKey);
      } else {
        setLastAction(action);
        dispatch(action);
      }
    },
    [dispatch, socket],
  );

  useEffect(() => {
    if (lastAction) {
      const effect = globalEffects(state, lastAction);
      setLastAction(null);
      if (effect && socket && socket.readyState === socket.OPEN) {
        socket.send(JSON.stringify(effect));
      }
    }
  }, [state, lastAction, socket]);

  return dispatchWithEffects;
}

const getConnectAttemptDelayMs = (connectAttemptNumber: number): number =>
  Math.min(16000, 1000 * 2 ** connectAttemptNumber);

type SocketState = {
  uniqueName: string;
  tempName: string;
  socket: WebSocket | null;
  error: boolean;
  connecting: boolean;
  connectAttemptNumber: number;
};

type SocketHookResult = {
  name: string | null;
  identified: boolean;
  onIdentify: (name: string) => void;
  connecting: boolean;
  error: boolean;
  ready: boolean;
  socket: WebSocket | null;
};

export function useSocket(onMessage: OnMessage, onLogin: (name: string) => void): SocketHookResult {
  const [storedName, saveName] = useStorageState<string>(localStorage, clientNameKey, '');
  const [{ uniqueName, tempName, socket, error, connecting }, setState] = useState<SocketState>({
    uniqueName: getUniqueName(storedName),
    tempName: storedName,
    socket: null,
    error: false,
    connecting: false,
    connectAttemptNumber: 0,
  });

  const connectAttemptTimer = useRef<number>();

  useEffect(() => {
    let cancelled = false;
    let ws: WebSocket | undefined;

    const connectIfPossible = (): void => {
      if (!tempName) {
        setState((last) => ({ ...last, connecting: false, error: false }));
        return;
      }

      setState((last) => ({ ...last, connecting: true }));

      const uniqueTempName = getUniqueName(tempName);
      ws = new WebSocket(`${getPubsubUrl()}?client-name=${uniqueTempName}`);

      ws.onopen = (): void => {
        if (!cancelled && ws && ws.readyState === ws.OPEN) {
          setState((last) => ({
            ...last,
            error: false,
            connecting: false,
            connectAttemptNumber: 0,
            uniqueName: uniqueTempName,
            socket: ws ?? null,
          }));

          saveName(tempName);
          onLogin(uniqueTempName);
        }
      };

      ws.onmessage = onMessage;

      ws.onclose = (): void => {
        setState((last) => {
          clearTimeout(connectAttemptTimer.current);
          connectAttemptTimer.current = setTimeout(
            connectIfPossible,
            getConnectAttemptDelayMs(last.connectAttemptNumber),
          );

          return {
            ...last,
            socket: null,
            connecting: false,
            connectAttemptNumber: last.connectAttemptNumber + 1,
          };
        });
      };

      ws.onerror = (): void => {
        setState((last) => ({ ...last, error: true }));
      };
    };

    connectIfPossible();

    return (): void => {
      clearTimeout(connectAttemptTimer.current);
      cancelled = true;
    };
  }, [onMessage, onLogin, tempName, saveName]);

  const onIdentify = useCallback(
    (name: string) => setState((last) => ({ ...last, tempName: name })),
    [],
  );

  return {
    name: uniqueName,
    identified: !!tempName,
    onIdentify,
    connecting,
    error,
    ready: !!(socket && socket.readyState === socket.OPEN),
    socket,
  };
}

export function useKeepalive(socket: WebSocket | null): void {
  const keepalive = useRef<number>();

  useEffect(() => {
    if (!socket) {
      return noop;
    }

    keepalive.current = window.setInterval(() => {
      if (socket.readyState === socket.OPEN) {
        socket.send(JSON.stringify({ type: 'PING' }));
      } else {
        socket.close();
      }
    }, socketKeepaliveTimeout);

    return (): void => {
      clearInterval(keepalive.current);
    };
  }, [socket]);
}
