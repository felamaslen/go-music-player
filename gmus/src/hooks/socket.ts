import { nanoid } from 'nanoid';
import { Dispatch, useCallback, useEffect, useRef, useState } from 'react';
import { useStorageState } from 'react-storage-hooks';

import { AnyAction } from '../actions';
import { socketKeepaliveTimeout } from '../constants/system';
import { globalEffects } from '../effects';
import { GlobalState } from '../reducer';
import { getPubsubUrl } from '../utils/url';

const getUniqueName = (name: string): string => (name.length ? `${name}-${nanoid(5)}` : '');

export type OnMessage = (message: MessageEvent<unknown>) => void;

export function useOnMessage(dispatch: Dispatch<AnyAction>): OnMessage {
  return useCallback<OnMessage>(
    ({ data }: MessageEvent<unknown>): void => {
      try {
        const action = JSON.parse(data as string) as AnyAction;
        dispatch(action);
      } catch (err) {
        console.warn('Error parsing message from websocket', err.message);
      }
    },
    [dispatch],
  );
}

export function useDispatchEffects(socket: WebSocket, state: GlobalState): void {
  useEffect(() => {
    const remoteEffect = globalEffects(state);
    if (remoteEffect) {
      socket.send(JSON.stringify(remoteEffect));
    }
  }, [socket, state]);
}

export function useSocket(
  onMessage: OnMessage,
  onLogin: (name: string) => void,
): {
  name: string | null;
  onIdentify: (name: string) => void;
  socket: WebSocket | null;
  error: boolean;
  connecting: boolean;
  connected: boolean;
} {
  const [storedName, saveName] = useStorageState<string>(localStorage, 'client-name', '');
  const [uniqueName, setUniqueName] = useState<string>(getUniqueName(storedName));
  const [tempName, setTempName] = useState<string>(storedName);

  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [error, setError] = useState<boolean>(false);

  const [connecting, setConnecting] = useState<boolean>(false);

  const onIdentify = useCallback((newName: string) => {
    setTempName(newName);
  }, []);

  useEffect(() => {
    let cancelled = false;
    let ws: WebSocket | undefined;
    if (tempName) {
      setConnecting(true);

      const uniqueTempName = getUniqueName(tempName);
      ws = new WebSocket(`${getPubsubUrl()}?client-name=${uniqueTempName}`);

      ws.onopen = (): void => {
        if (!cancelled && ws && ws.readyState === ws.OPEN) {
          setError(false);
          setConnecting(false);

          saveName(tempName);
          setUniqueName(uniqueTempName);

          setSocket(ws);
          onLogin(uniqueTempName);
        }
      };

      ws.onmessage = onMessage;

      ws.onclose = (): void => {
        if (cancelled) {
          return;
        }

        setError(false);
        setSocket(null);
      };
    } else {
      setConnecting(false);
      setError(false);
    }

    return (): void => {
      cancelled = true;
      ws?.close();
    };
  }, [onMessage, onLogin, tempName, saveName]);

  return {
    name: uniqueName,
    onIdentify,
    socket,
    error,
    connecting,
    connected: !!socket && socket?.readyState === socket?.OPEN,
  };
}

export function useKeepalive(socket: WebSocket): void {
  const keepalive = useRef<number>();

  useEffect(() => {
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
