import { useEffect, useRef, useState } from 'react';
import { useStorageState } from 'react-storage-hooks';

import { socketKeepaliveTimeout } from '../constants/system';
import { getPubsubUrl } from '../utils/url';

export function useSocket(): {
  name: string | null;
  onIdentify: (name: string) => void;
  socket: WebSocket | null;
  error: boolean;
  connecting: boolean;
  connected: boolean;
} {
  const [name, saveName] = useStorageState<string>(localStorage, 'client-name', '');
  const [tempName, setTempName] = useState<string>(name);

  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [error, setError] = useState<boolean>(false);

  const [connecting, setConnecting] = useState<boolean>(false);

  useEffect(() => {
    let cancelled = false;
    let ws: WebSocket | undefined;
    if (tempName) {
      setConnecting(true);

      ws = new WebSocket(`${getPubsubUrl()}?client-name=${tempName}`);

      ws.onopen = (): void => {
        if (!cancelled && ws && ws.readyState === ws.OPEN) {
          setError(false);
          setConnecting(false);

          saveName(tempName);

          setSocket(ws);
        }
      };

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
  }, [tempName, saveName]);

  return {
    name,
    onIdentify: setTempName,
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
