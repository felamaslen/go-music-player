import { act, fireEvent, render, RenderResult } from '@testing-library/react';
import WS from 'jest-websocket-mock';
import React from 'react';
import * as storageHooks from 'react-storage-hooks';

import { useSocket } from './socket';

describe(useSocket.name, () => {
  afterEach(WS.clean);

  const TestComponent: React.FC = () => {
    const { onIdentify, socket, ...hookResult } = useSocket();

    return (
      <>
        <button onClick={(): void => onIdentify('my-client-name')}>Identify!</button>
        <button onClick={(): void => socket?.send('Hello world!')}>Say hello!</button>
        <div data-testid="hook-result">{JSON.stringify(hookResult)}</div>
      </>
    );
  };

  it.each`
    testCase                   | key             | expectedValue
    ${'the name'}              | ${'name'}       | ${''}
    ${'the error status'}      | ${'error'}      | ${false}
    ${'the connecting status'} | ${'connecting'} | ${false}
    ${'the connected status'}  | ${'connected'}  | ${false}
  `('should return $testCase', ({ key, expectedValue }) => {
    expect.assertions(1);
    const { getByTestId } = render(<TestComponent />);

    expect(JSON.parse(getByTestId('hook-result').innerHTML)).toStrictEqual(
      expect.objectContaining({
        [key]: expectedValue,
      }),
    );
  });

  describe('when identifying', () => {
    let server: WS;
    const saveName: React.Dispatch<unknown> = jest.fn();
    beforeEach(() => {
      server = new WS('ws://my-api.url:1234/pubsub');
      jest
        .spyOn(storageHooks, 'useStorageState')
        .mockReturnValue(['' as unknown, saveName, undefined]);
    });

    const setupIdentify = (): RenderResult => {
      const renderResult = render(<TestComponent />);
      act(() => {
        fireEvent.click(renderResult.getByText('Identify!'));
      });

      return renderResult;
    };

    it('should create a new connection to the socket, using the client name in the query', async () => {
      expect.assertions(1);
      setupIdentify();

      const res = await server.connected;
      expect(res.url).toBe('ws://my-api.url:1234/pubsub?client-name=my-client-name');
    });

    it('should open a new socket', async () => {
      expect.assertions(2);
      const { getByText } = setupIdentify();
      await act(async () => {
        await server.connected;
      });

      act(() => {
        fireEvent.click(getByText('Say hello!'));
      });

      await expect(server).toReceiveMessage('Hello world!');
      expect(server).toHaveReceivedMessages(['Hello world!']);
    });

    it('should set the connected state to true', async () => {
      expect.assertions(1);
      const { getByTestId } = setupIdentify();
      await act(async () => {
        await server.connected;
      });

      expect(JSON.parse(getByTestId('hook-result').innerHTML)).toStrictEqual(
        expect.objectContaining({
          connecting: false,
          connected: true,
        }),
      );
    });

    it('should save the client name', async () => {
      expect.assertions(2);
      setupIdentify();
      await act(async () => {
        await server.connected;
      });

      expect(saveName).toHaveBeenCalledTimes(1);
      expect(saveName).toHaveBeenCalledWith('my-client-name');
    });
  });

  describe('when the name is stored in localStorage', () => {
    let server: WS;
    const saveName: React.Dispatch<unknown> = jest.fn();
    beforeEach(() => {
      server = new WS('ws://my-api.url:1234/pubsub');
      jest
        .spyOn(storageHooks, 'useStorageState')
        .mockReturnValue(['my-stored-name' as unknown, saveName, undefined]);
    });

    it('should set connecting to true', () => {
      expect.assertions(1);
      const { getByTestId } = render(<TestComponent />);

      expect(JSON.parse(getByTestId('hook-result').innerHTML)).toStrictEqual(
        expect.objectContaining({
          connecting: true,
          connected: false,
        }),
      );
    });

    it('should open a socket immediately, using the stored name', async () => {
      expect.assertions(3);
      const { getByText } = render(<TestComponent />);

      const res = await server.connected;

      expect(res.url).toBe('ws://my-api.url:1234/pubsub?client-name=my-stored-name');

      act(() => {
        fireEvent.click(getByText('Say hello!'));
      });

      await expect(server).toReceiveMessage('Hello world!');
      expect(server).toHaveReceivedMessages(['Hello world!']);
    });

    it('should set connecting to false after the socket is connected', async () => {
      expect.assertions(1);
      const { getByTestId } = render(<TestComponent />);

      await server.connected;

      expect(JSON.parse(getByTestId('hook-result').innerHTML)).toStrictEqual(
        expect.objectContaining({
          connecting: false,
          connected: true,
        }),
      );
    });
  });
});
