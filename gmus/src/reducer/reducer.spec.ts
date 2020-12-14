import {
  ActionClientConnected,
  ActionClientDisconnected,
  ActionStateSetLocal,
  ActionStateSetRemote,
  ActionTypeLocal,
  ActionTypeRemote,
} from '../actions';
import { composedGlobalReducer, globalReducer, initialState } from './reducer';

describe(globalReducer.name, () => {
  describe(ActionTypeRemote.StateSet, () => {
    const action: ActionStateSetRemote = {
      type: ActionTypeRemote.StateSet,
      payload: {
        songId: 123,
        playing: true,
        playTimeSeconds: 75,
        currentClient: 'some-client',
      },
    };

    it('should set the player state', () => {
      expect.assertions(1);
      const result = globalReducer(initialState, action);

      expect(result.player).toStrictEqual({
        songId: 123,
        playing: true,
        playTimeSeconds: 75,
        currentClient: 'some-client',
      });
    });
  });

  describe(ActionTypeLocal.StateSet, () => {
    const action: ActionStateSetLocal = {
      type: ActionTypeLocal.StateSet,
      payload: {
        songId: 123,
        playing: true,
        playTimeSeconds: 75,
        currentClient: 'some-client',
      },
    };

    it('should set the player state', () => {
      expect.assertions(1);
      const result = globalReducer(initialState, action);

      expect(result.player).toStrictEqual({
        songId: 123,
        playing: true,
        playTimeSeconds: 75,
        currentClient: 'some-client',
      });
    });
  });

  const actionClientConnected: ActionClientConnected = {
    type: ActionTypeRemote.ClientConnected,
    payload: ['client1', 'client2'],
  };

  const actionClientDisconnected: ActionClientDisconnected = {
    type: ActionTypeRemote.ClientDisconnected,
    payload: ['client1'],
  };

  describe.each`
    actionType                             | action                      | expectedClientList
    ${ActionTypeRemote.ClientConnected}    | ${actionClientConnected}    | ${['client1', 'client2']}
    ${ActionTypeRemote.ClientDisconnected} | ${actionClientDisconnected} | ${['client1']}
  `('$actionType', ({ action, expectedClientList }) => {
    it('should update the client list', () => {
      expect.assertions(1);
      const result = globalReducer(initialState, action);

      expect(result.clientList).toStrictEqual(expectedClientList);
    });
  });
});

describe(composedGlobalReducer.name, () => {
  it('should set the lastAction prop', () => {
    expect.assertions(1);

    const action: ActionStateSetRemote = {
      type: ActionTypeRemote.StateSet,
      payload: null,
    };

    const result = composedGlobalReducer(initialState, action);

    expect(result.lastAction).toBe(action);
  });
});
