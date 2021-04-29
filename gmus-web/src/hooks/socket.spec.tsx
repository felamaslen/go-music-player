import { act, fireEvent, render, RenderResult, waitFor } from '@testing-library/react';
import WS from 'jest-websocket-mock';
import * as nanoid from 'nanoid';
import React, { Dispatch } from 'react';
import * as storageHooks from 'react-storage-hooks';

import { AnyAction, LocalAction, RemoteAction } from '../actions';
import * as effects from '../effects/effects';
import { GlobalState } from '../reducer';

import { useOnMessage, useDispatchWithEffects, useSocket } from './socket';

jest.mock('nanoid');

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

describe(useDispatchWithEffects.name, () => {
  const someAction = ({
    type: 'SOME_ACTION',
    payload: 'yes',
  } as unknown) as LocalAction;

  const state = ({ my: 'state' } as unknown) as GlobalState;

  const dispatch = jest.fn();

  const socket = ({
    send: jest.fn(),
    OPEN: WebSocket.OPEN,
    readyState: WebSocket.OPEN,
  } as unknown) as WebSocket;

  const someEffect = ({
    type: 'SOME_EFFECT',
    payload: {
      fromClient: 'us',
      data: 'yes',
    },
  } as unknown) as RemoteAction;

  const TestComponent: React.FC = () => {
    const dispatchWithEffects = useDispatchWithEffects(state, dispatch, socket);

    return (
      <>
        <button onClick={(): void => dispatchWithEffects(someAction)}>Dispatch!</button>
      </>
    );
  };

  describe('when an action is dispatched', () => {
    let globalEffectsSpy: jest.SpyInstance;

    describe('and no effect is associated', () => {
      beforeEach(() => {
        globalEffectsSpy = jest.spyOn(effects, 'globalEffects').mockReturnValueOnce(null);
      });

      it('should dispatch the action to the local store', async () => {
        expect.hasAssertions();
        const { getByText } = render(<TestComponent />);
        expect(dispatch).not.toHaveBeenCalled();
        act(() => {
          fireEvent.click(getByText('Dispatch!'));
        });

        await waitFor(() => {
          expect(dispatch).toHaveBeenCalledWith(someAction);
        });
      });

      it('should not send a message to the socket', () => {
        expect.assertions(1);
        const { getByText } = render(<TestComponent />);
        act(() => {
          fireEvent.click(getByText('Dispatch!'));
        });

        expect(socket.send).not.toHaveBeenCalled();
      });
    });

    describe('and an effect is associated', () => {
      beforeEach(() => {
        globalEffectsSpy = jest.spyOn(effects, 'globalEffects').mockReturnValueOnce(someEffect);
      });

      it('should dispatch the action to the local store', async () => {
        expect.hasAssertions();

        const { getByText } = render(<TestComponent />);
        expect(dispatch).not.toHaveBeenCalled();
        act(() => {
          fireEvent.click(getByText('Dispatch!'));
        });

        await waitFor(() => {
          expect(dispatch).toHaveBeenCalledWith(someAction);
        });
      });

      it('should send a message to the socket', () => {
        expect.assertions(4);
        const { getByText } = render(<TestComponent />);
        act(() => {
          fireEvent.click(getByText('Dispatch!'));
        });

        expect(globalEffectsSpy).toHaveBeenCalledTimes(1);
        expect(globalEffectsSpy).toHaveBeenCalledWith(state, someAction);

        expect(socket.send).toHaveBeenCalledTimes(1);
        expect(socket.send).toHaveBeenCalledWith(JSON.stringify(someEffect));
      });
    });
  });
});

describe(useSocket.name, () => {
  let nanoidMock: jest.SpyInstance;
  beforeEach(() => {
    nanoidMock = jest.spyOn(nanoid, 'nanoid').mockReturnValue('A5v3D');
  });

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
    ${'the connecting status'} | ${'connecting'} | ${false}
    ${'the error status'}      | ${'error'}      | ${false}
    ${'the ready status'}      | ${'ready'}      | ${false}
    ${'the identified status'} | ${'identified'} | ${false}
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

    it('should set the connecting, ready and identified state', async () => {
      expect.assertions(2);
      const { getByTestId } = setupIdentify();

      expect(JSON.parse(getByTestId('hook-result').innerHTML)).toStrictEqual(
        expect.objectContaining({
          connecting: true,
          error: false,
          ready: false,
          identified: true,
        }),
      );

      await act(async () => {
        await server.connected;
      });

      expect(JSON.parse(getByTestId('hook-result').innerHTML)).toStrictEqual(
        expect.objectContaining({
          connecting: false,
          error: false,
          ready: true,
          identified: true,
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

    it('should set the status', () => {
      expect.assertions(1);
      const { getByTestId } = render(<TestComponent />);

      expect(JSON.parse(getByTestId('hook-result').innerHTML)).toStrictEqual(
        expect.objectContaining({
          connecting: true,
          error: false,
          identified: true,
          ready: false,
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
          error: false,
          identified: true,
          ready: true,
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

  describe('when an error occurs', () => {
    let server: WS;
    beforeEach(() => {
      nanoidMock.mockRestore();
      jest
        .spyOn(nanoid, 'nanoid')
        .mockReturnValueOnce('called-once-from-storedname')
        .mockReturnValueOnce('a1234')
        .mockReturnValue('notthis');

      server = new WS('ws://my-api.url:1234/pubsub');
    });

    const setupError = async (): Promise<RenderResult> => {
      const utils = render(<TestComponent />);
      act(() => {
        fireEvent.click(utils.getByText('Identify!'));
      });

      await server.connected;

      act(() => {
        server.error();
      });

      server = new WS('ws://my-api.url:1234/pubsub');

      return utils;
    };

    it('should reconnect automatically', async () => {
      expect.assertions(1);
      const { unmount } = await setupError();

      await server.connected;

      server.send('foo');

      expect(onMessage).toHaveBeenCalledTimes(1);
      act(() => {
        unmount();
      });
    });

    it('should use the same name when reconnecting', async () => {
      expect.assertions(1);
      await setupError();

      const res = await server.connected;

      expect(res.url).toBe('ws://my-api.url:1234/pubsub?client-name=my-client-name-a1234');
    });

    it('should set error to true but keep the identified state', async () => {
      expect.hasAssertions();
      const { getByTestId, unmount } = await setupError();

      expect(JSON.parse(getByTestId('hook-result').innerHTML)).toStrictEqual(
        expect.objectContaining({
          ready: false,
          error: true,
          connecting: false,
          identified: true,
        }),
      );

      await waitFor(() => {
        expect(JSON.parse(getByTestId('hook-result').innerHTML)).toStrictEqual(
          expect.objectContaining({
            ready: false,
            error: true,
            connecting: true,
            identified: true,
          }),
        );
      });

      await server.connected;

      await waitFor(() => {
        expect(JSON.parse(getByTestId('hook-result').innerHTML)).toStrictEqual(
          expect.objectContaining({
            ready: true,
            error: false,
            connecting: false,
            identified: true,
          }),
        );
      });
      act(() => {
        unmount();
      });
    });
  });
});
