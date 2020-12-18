import axios, { Canceler, AxiosInstance, AxiosResponse } from 'axios';
import { useEffect, useRef, useState } from 'react';

type Options<Query, Response> = {
  query: Query;
  pause?: boolean;
  sendRequest: (axiosInstance: AxiosInstance, query: Query) => Promise<AxiosResponse<Response>>;
  handleResponse: (res: Response, query: Query) => void;
  onError?: (err: Error) => void;
  onClear?: () => void;
  debounceDelay?: number;
};

export function useCancellableRequest<Query, Response = void>({
  query,
  pause,
  sendRequest,
  handleResponse,
  onError,
  onClear,
}: Options<Query, Response>): boolean {
  const [loading, setLoading] = useState<boolean>(false);

  const cancelRequest = useRef<Canceler>();

  useEffect(() => {
    setLoading(!!query);
    if (!query) {
      onClear?.();
    }
  }, [query, onClear]);

  useEffect(() => {
    let cancelled = false;
    const request = async (): Promise<void> => {
      try {
        const axiosWithToken = axios.create({
          cancelToken: new axios.CancelToken((token): void => {
            cancelRequest.current = token;
          }),
        });
        const res = await sendRequest(axiosWithToken, query);
        if (cancelled) {
          return;
        }

        handleResponse(res.data, query);
      } catch (err) {
        if (!axios.isCancel(err)) {
          onError?.(err);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    if (!pause) {
      request();
    }

    return (): void => {
      cancelled = true;
      if (cancelRequest.current) {
        cancelRequest.current();
      }
    };
  }, [sendRequest, handleResponse, onError, query, pause]);

  return loading;
}
