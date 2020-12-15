import {
  ActionClientListUpdated,
  ActionStateSetLocal,
  ActionStateSetRemote,
  ActionTypeLocal,
  ActionTypeRemote,
  nameSet,
  stateSet,
} from '../actions';
import { MusicPlayer } from '../types/state';
import { composedGlobalReducer, globalReducer, initialState, nullPlayer } from './reducer';
import { GlobalState } from './types';

describe(globalReducer.name, () => {
  describe(ActionTypeRemote.StateSet, () => {
    const action: ActionStateSetRemote = {
      type: ActionTypeRemote.StateSet,
      payload: {
        songId: 123,
        playing: true,
        currentTime: 75,
        master: 'some-client',
      },
    };

    it('should set the player state', () => {
      expect.assertions(1);
      const result = globalReducer(initialState, action);

      expect(result.player).toStrictEqual({
        songId: 123,
        playing: true,
        currentTime: 75,
        master: 'some-client',
      });
    });

    describe('when the client is master', () => {
      const stateMaster: GlobalState = {
        ...initialState,
        player: {
          ...nullPlayer,
          master: 'some-client',
          currentTime: 31,
        },
        myClientName: 'some-client',
      };

      it('should not update the currentTime', () => {
        expect.assertions(1);
        const result = globalReducer(stateMaster, action);

        expect(result.player).toStrictEqual<MusicPlayer>({
          songId: 123,
          playing: true,
          currentTime: 31, // not updated from the action
          master: 'some-client',
        });
      });
    });

    describe('when the client was the master but no longer', () => {
      const stateDifferentMaster: GlobalState = {
        ...initialState,
        player: {
          ...nullPlayer,
          master: 'a-client-16b3',
          currentTime: 31,
        },
        myClientName: 'a-client-16b3',
      };

      it('should update the currentTime', () => {
        expect.assertions(1);
        const result = globalReducer(stateDifferentMaster, action);

        expect(result.player).toStrictEqual<MusicPlayer>({
          songId: 123,
          playing: true,
          currentTime: 75,
          master: 'some-client',
        });
      });
    });
  });

  describe(ActionTypeLocal.StateSet, () => {
    const action = stateSet({
      songId: 123,
      playing: true,
      currentTime: 75,
      master: 'some-client',
    });

    it('should set the player state', () => {
      expect.assertions(1);
      const result = globalReducer(initialState, action);

      expect(result.player).toStrictEqual({
        songId: 123,
        playing: true,
        currentTime: 75,
        master: 'some-client',
      });
    });

    describe('when the state update is partial', () => {
      const actionPartial: ActionStateSetLocal = stateSet({
        playing: false,
      });

      it('should update the given part of the state', () => {
        expect.assertions(1);

        const result = globalReducer(globalReducer(initialState, action), actionPartial);

        expect(result.player).toStrictEqual({
          songId: 123,
          playing: false,
          currentTime: 75,
          master: 'some-client',
        });
      });
    });
  });

  describe(ActionTypeLocal.NameSet, () => {
    it('should set the name', () => {
      expect.assertions(1);

      expect(globalReducer(initialState, nameSet('foo')).myClientName).toBe('foo');
    });
  });

  describe(ActionTypeRemote.ClientListUpdated, () => {
    const action: ActionClientListUpdated = {
      type: ActionTypeRemote.ClientListUpdated,
      payload: [
        {
          name: 'client1-ab54x',
          lastPing: 1665912239,
        },
        {
          name: 'client1-ab54x',
          lastPing: 1665912262,
        },
      ],
    };

    it('should update the client list', () => {
      expect.assertions(1);
      const result = globalReducer(initialState, action);

      expect(result.clientList).toStrictEqual(action.payload);
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
