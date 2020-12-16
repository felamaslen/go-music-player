import {
  ActionStateSetRemote,
  ActionTypeLocal,
  ActionTypeRemote,
  masterRetaken,
  seeked,
  stateSet,
} from '../actions';
import { GlobalState, initialState } from '../reducer';
import { MusicPlayer } from '../types/state';
import { globalEffects } from './effects';

describe(globalEffects.name, () => {
  describe(ActionTypeLocal.StateSet, () => {
    it('should create a remote state set action', () => {
      expect.assertions(1);

      const localPlayer: MusicPlayer = {
        songId: 123,
        playing: false,
        currentTime: 83,
        seekTime: 87,
        master: 'my-client',
      };

      const prevState: GlobalState = {
        ...initialState,
        myClientName: 'my-client-name',
      };

      const result = globalEffects(prevState, stateSet(localPlayer));

      expect(result).toStrictEqual<ActionStateSetRemote>({
        type: ActionTypeRemote.StateSet,
        payload: localPlayer,
      });
    });
  });

  describe(ActionTypeLocal.Seeked, () => {
    const stateMaster: GlobalState = {
      ...initialState,
      player: {
        songId: 123,
        playing: false,
        currentTime: 83,
        seekTime: 87,
        master: 'my-client-name',
      },
      myClientName: 'my-client-name',
    };

    const stateSlave: GlobalState = {
      ...initialState,
      player: { ...initialState.player, master: 'some-master-client' },
      myClientName: 'some-slave-client',
    };

    describe.each`
      clientType   | state
      ${'master'}  | ${stateMaster}
      ${'a slave'} | ${stateSlave}
    `('when the client is $clientType', ({ state }) => {
      it('should create a remote state set action', () => {
        expect.assertions(1);

        const result = globalEffects(state, seeked(776));

        expect(result).toStrictEqual<ActionStateSetRemote>({
          type: ActionTypeRemote.StateSet,
          payload: { ...state.player, seekTime: 776 },
        });
      });
    });
  });

  describe(ActionTypeLocal.MasterRetaken, () => {
    const stateMasterWentAway: GlobalState = {
      ...initialState,
      clientList: [{ name: 'my-client-name', lastPing: 0 }],
      player: {
        songId: 123,
        playing: true,
        currentTime: 83,
        seekTime: 5,
        master: 'some-master-went-away',
      },
      myClientName: 'my-client-name',
    };

    it('should return a StateSet action informing other clients that we are the new master', () => {
      expect.assertions(1);
      const result = globalEffects(stateMasterWentAway, masterRetaken());

      expect(result).toStrictEqual<ActionStateSetRemote>({
        type: ActionTypeRemote.StateSet,
        payload: {
          songId: 123,
          playing: false,
          currentTime: 83,
          seekTime: -1,
          master: 'my-client-name',
        },
      });
    });
  });
});
