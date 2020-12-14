import { act, fireEvent, render, RenderResult } from '@testing-library/react';
import WS from 'jest-websocket-mock';
import React from 'react';

import { AnyAction, RemoteAction } from '../actions';
import * as effects from '../effects/effects';
import * as reducer from '../reducer/reducer';

import { useGlobalState } from './state';

describe(useGlobalState.name, () => {
  afterEach(WS.clean);

  let server: WS;
  beforeEach(() => {
    server = new WS('ws://my.api:1234');
  });

  const someAction = ({
    type: 'SOME_ACTION',
    payload: 'yes',
  } as unknown) as AnyAction;

  const otherAction = ({
    type: 'OTHER_ACTION',
    payload: {
      three: Infinity,
    },
  } as unknown) as RemoteAction;

  const TestComponent: React.FC<{ socket: WebSocket }> = ({ socket }) => {
    const [state, dispatch] = useGlobalState(socket);

    return (
      <>
        <div data-testid="state">{JSON.stringify(state)}</div>
        <button onClick={(): void => dispatch(someAction)}>Dispatch!</button>
      </>
    );
  };

  const setup = async (): Promise<RenderResult> => {
    const socket = new WebSocket('ws://my.api:1234');
    await server.connected;
    return render(<TestComponent socket={socket} />);
  };

  describe('when a message comes in from the socket', () => {
    it('should dispatch the action to the global reducer', async () => {
      expect.assertions(1);

      jest.spyOn(reducer, 'composedGlobalReducer').mockImplementationOnce((state, action) => {
        if (((action as unknown) as Record<string, unknown>).type === 'OTHER_ACTION') {
          return { ...state, it: 'worked' } as reducer.GlobalState;
        }
        return state;
      });

      const { getByTestId } = await setup();

      act(() => {
        server.send(JSON.stringify(otherAction));
      });

      expect(JSON.parse(getByTestId('state').innerHTML)).toStrictEqual(
        expect.objectContaining({ it: 'worked' }),
      );
    });
  });

  describe('when an action is dispatched locally which produces an effect', () => {
    it('should send the effect action to the socket', async () => {
      expect.assertions(2);

      jest.spyOn(reducer, 'globalReducer').mockReturnValueOnce({
        ...reducer.initialState,
        lastAction: someAction,
      });

      jest.spyOn(effects, 'globalEffects').mockReturnValueOnce(otherAction);

      const { getByText } = await setup();
      act(() => {
        fireEvent.click(getByText('Dispatch!'));
      });

      await expect(server).toReceiveMessage(JSON.stringify(otherAction));
      expect(server).toHaveReceivedMessages([JSON.stringify(otherAction)]);
    });
  });
});
