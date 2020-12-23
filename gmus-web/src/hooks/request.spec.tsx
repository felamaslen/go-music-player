import { act, fireEvent, render, RenderResult, waitFor } from '@testing-library/react';
import { AxiosInstance, AxiosResponse } from 'axios';
import nock from 'nock';
import React from 'react';

import { useRequestCallback } from './request';

describe(useRequestCallback.name, () => {
  type MyQuery = { something: string };
  type MyResponse = { result: number };

  const onError = jest.fn();
  const sendRequest = (axios: AxiosInstance, query: MyQuery): Promise<AxiosResponse<MyResponse>> =>
    axios.get(`http://my-api.url:1234/my/request?something=${query.something}`);

  const TestComponent: React.FC = () => {
    const [onRequest, response, loading, cancel] = useRequestCallback<MyQuery, MyResponse>({
      onError,
      sendRequest,
    });

    return (
      <>
        <button onClick={(): void => onRequest({ something: 'yes' })}>Send request!</button>
        <button onClick={(): void => cancel.current?.()}>Cancel!</button>
        <div data-testid="response">{JSON.stringify(response)}</div>
        <div data-testid="loading">{loading ? 'Loading' : 'Not loading'}</div>
      </>
    );
  };

  afterEach(() => {
    nock.cleanAll();
  });

  const setupRequest = (): RenderResult => {
    const renderResult = render(<TestComponent />);
    act(() => {
      fireEvent.click(renderResult.getByText('Send request!'));
    });
    return renderResult;
  };

  it('should return null as the initial response', () => {
    expect.assertions(1);
    const { getByTestId } = render(<TestComponent />);
    expect(JSON.parse(getByTestId('response').innerHTML)).toBeNull();
  });

  it('should initially set the loading state to false', () => {
    expect.assertions(1);
    const { getByTestId } = render(<TestComponent />);
    expect(getByTestId('loading')).toHaveTextContent('Not loading');
  });

  describe('when sending a request', () => {
    beforeEach(() => {
      nock('http://my-api.url:1234')
        .get('/my/request?something=yes')
        .reply(200, { result: 125 }, { 'Access-Control-Allow-Origin': '*' });
    });

    it('should set the loading state to true', async () => {
      expect.assertions(1);
      const { getByTestId, unmount } = setupRequest();
      expect(getByTestId('loading')).toHaveTextContent('Loading');
      unmount();
    });

    it('should set the response and loading state back to false', async () => {
      expect.hasAssertions();

      const { getByTestId, unmount } = setupRequest();

      await waitFor(() => {
        expect(getByTestId('loading')).toHaveTextContent('Not loading');
      });

      expect(JSON.parse(getByTestId('response').innerHTML)).toStrictEqual({ result: 125 });
      unmount();
    });

    describe('when the request is cancelled', () => {
      it('should set the loading state back to false and not set the response', async () => {
        expect.hasAssertions();

        const { getByText, getByTestId, unmount } = setupRequest();
        act(() => {
          fireEvent.click(getByText('Cancel!'));
        });

        expect(getByTestId('loading')).toHaveTextContent('Loading');

        await waitFor(() => {
          expect(getByTestId('loading')).toHaveTextContent('Not loading');
        });

        expect(JSON.parse(getByTestId('response').innerHTML)).toBeNull();

        unmount();
      });
    });
  });

  describe('when an error occurs', () => {
    beforeEach(() => {
      nock('http://my-api.url:1234')
        .get('/my/request?something=yes')
        .reply(500, 'Some error occurred', { 'Access-Control-Allow-Origin': '*' });

      onError.mockClear();
    });

    it('should call onError', async () => {
      expect.hasAssertions();
      const { unmount } = setupRequest();

      await waitFor(() => {
        expect(onError).toHaveBeenCalledTimes(1);
        expect(onError).toHaveBeenCalledWith(new Error('Request failed with status code 500'));
      });
      unmount();
    });
  });
});
