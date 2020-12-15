import { act, fireEvent, render, RenderResult } from '@testing-library/react';
import WS from 'jest-websocket-mock';
import React, { Dispatch } from 'react';
import * as storageHooks from 'react-storage-hooks';

import { AnyAction, RemoteAction } from '../actions';
import * as effects from '../effects/effects';
import { GlobalState } from '../reducer';

import { useDispatchEffects, useOnMessage, useSocket } from './socket';

jest.mock('nanoid', () => ({
  nanoid: (): string => 'A5v3D',
}));

describe(useOnMessage.name, () => {
  const dispatch: Dispatch<AnyAction> = jest.fn();

  const testMessage = {
    data: JSON.stringify({
      type: 'SOME_ACTION_FROM_SOCKET',
      payload: {
        some: 'thing',
      },
    }),
  } as MessageEvent<unknown>;

  const TestComponent: React.FC = () => {
    const onMessage = useOnMessage(dispatch);

    return <button onClick={(): void => onMessage(testMessage)}>Simulate message!</button>;
  };

  it('should return a function which dispatches actions', () => {
    expect.assertions(2);

    const { getByText } = render(<TestComponent />);
    act(() => {
      fireEvent.click(getByText('Simulate message!'));
    });

    expect(dispatch).toHaveBeenCalledTimes(1);
    expect(dispatch).toHaveBeenCalledWith({
      type: 'SOME_ACTION_FROM_SOCKET',
      payload: {
        some: 'thing',
      },
    });
  });
});

describe(useDispatchEffects.name, () => {
  const someAction = ({
    type: 'SOME_ACTION',
    payload: 'yes',
  } as unknown) as RemoteAction;

  const state = {} as GlobalState;

  const socket = ({
    send: jest.fn(),
  } as unknown) as WebSocket;

  const TestComponent: React.FC = () => {
    useDispatchEffects(socket, state);
    return null;
  };

  describe('when an action is dispatched locally which produces an effect', () => {
    it('should send the effect action to the socket', async () => {
      expect.assertions(2);

      jest.spyOn(effects, 'globalEffects').mockReturnValueOnce(someAction);

      render(<TestComponent />);

      expect(socket.send).toHaveBeenCalledTimes(1);
      expect(socket.send).toHaveBeenCalledWith(JSON.stringify(someAction));
    });
  });
});

describe(useSocket.name, () => {
  afterEach(WS.clean);

  const onMessage = jest.fn();
  const onLogin = jest.fn();

  const TestComponent: React.FC = () => {
    const { onIdentify, socket, ...hookResult } = useSocket(onMessage, onLogin);

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

    it('should create a new connection to the socket, using a unique client name in the query', async () => {
      expect.assertions(1);
      setupIdentify();

      const res = await server.connected;
      expect(res.url).toBe('ws://my-api.url:1234/pubsub?client-name=my-client-name-A5v3D');
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

    it('should return the unique name', async () => {
      expect.assertions(1);
      const { getByTestId } = setupIdentify();
      await act(async () => {
        await server.connected;
      });

      expect(JSON.parse(getByTestId('hook-result').innerHTML)).toStrictEqual(
        expect.objectContaining({
          name: 'my-client-name-A5v3D',
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

    it('should call onLogin', async () => {
      expect.assertions(2);
      setupIdentify();
      await act(async () => {
        await server.connected;
      });

      expect(onLogin).toHaveBeenCalledTimes(1);
      expect(onLogin).toHaveBeenCalledWith('my-client-name-A5v3D');
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

    it('should open a socket immediately, using a unique version of the stored name', async () => {
      expect.assertions(3);
      const { getByText } = render(<TestComponent />);

      const res = await server.connected;

      expect(res.url).toBe('ws://my-api.url:1234/pubsub?client-name=my-stored-name-A5v3D');

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

  describe('when a message is received from the server', () => {
    let server: WS;
    beforeEach(() => {
      server = new WS('ws://my-api.url:1234/pubsub');
    });

    it('should call onMessage', async () => {
      expect.assertions(2);
      const { getByText } = render(<TestComponent />);
      act(() => {
        fireEvent.click(getByText('Identify!'));
      });

      await server.connected;

      server.send('foo');

      expect(onMessage).toHaveBeenCalledTimes(1);
      expect(onMessage).toHaveBeenCalledWith(expect.objectContaining({ data: 'foo' }));
    });
  });
});
