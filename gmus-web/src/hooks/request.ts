import axios, { Canceler, AxiosInstance, AxiosResponse } from 'axios';
import { RefObject, useCallback, useEffect, useRef, useState } from 'react';

type Options<Query, Response> = {
  sendRequest: (axiosInstance: AxiosInstance, query: Query) => Promise<AxiosResponse<Response>>;
  onError?: (err: Error) => void;
};

export function useRequestCallback<Query, Response = void>({
  onError,
  sendRequest,
}: Options<Query, Response>): [
  (query: Query) => void,
  Response | null,
  boolean,
  RefObject<((unmount?: boolean) => void) | undefined>,
] {
  const [response, setResponse] = useState<Response | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const cancel = useRef<(unmount?: boolean) => void>();

  useEffect(() => (): void => cancel.current?.(true), []);

  const onRequest = useCallback(
    (query: Query) => {
      let cancelled = false;
      let unmounted = false;

      let cancelRequest: Canceler | null = null;

      cancel.current?.();
      cancel.current = (unmount = false): void => {
        cancelled = true;
        unmounted = unmount;
        cancelRequest?.();
      };

      const axiosWithToken = axios.create({
        cancelToken: new axios.CancelToken((token): void => {
          cancelRequest = token;
        }),
      });

      const makeRequest = async (): Promise<void> => {
        try {
          setLoading(true);
          const res = await sendRequest(axiosWithToken, query);

          if (!cancelled) {
            setResponse(res.data);
          }
        } catch (err) {
          if (!axios.isCancel(err)) {
            onError?.(err);
          }
        } finally {
          if (!unmounted) {
            setLoading(false);
          }
        }
      };

      makeRequest();
    },
    [onError, sendRequest],
  );

  return [onRequest, response, loading, cancel];
}
