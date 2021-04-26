import {
  ActionStateSetRemote,
  ActionTypeLocal,
  ActionTypeRemote,
  activeClientToggled,
  masterSet,
  playPaused,
  queueOrdered,
  queuePushed,
  queueRemoved,
  queueShifted,
  seeked,
  songInfoFetched,
  stateSet,
} from '../actions';
import { GlobalState, initialState } from '../reducer';
import { Song } from '../types';
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
        activeClients: [],
        queue: [],
      };

      const prevState: GlobalState = {
        ...initialState,
        myClientName: 'my-client-name',
      };

      const action = stateSet(localPlayer);

      const result = globalEffects(prevState, action);

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
        activeClients: [],
        queue: [],
      },
      myClientName: 'my-client-name',
    };

    const stateSlave: GlobalState = {
      ...initialState,
      player: { ...initialState.player, master: 'some-master-client' },
      myClientName: 'some-slave-client',
    };

    const action = seeked(776);

    describe.each`
      clientType   | state
      ${'master'}  | ${stateMaster}
      ${'a slave'} | ${stateSlave}
    `('when the client is $clientType', ({ state }) => {
      it('should create a remote state set action', () => {
        expect.assertions(1);

        const result = globalEffects(state, action);

        expect(result).toStrictEqual<ActionStateSetRemote>({
          type: ActionTypeRemote.StateSet,
          payload: { ...state.player, seekTime: 776 },
        });
      });
    });
  });

  describe(ActionTypeLocal.MasterSet, () => {
    const stateMasterWentAway: GlobalState = {
      ...initialState,
      clientList: [{ name: 'my-client-name', lastPing: 0 }],
      player: {
        songId: 123,
        playing: true,
        currentTime: 83,
        seekTime: 5,
        master: 'some-master-went-away',
        activeClients: [],
        queue: [],
      },
      myClientName: 'my-client-name',
    };

    const action = masterSet();

    it('should return a StateSet action informing other clients that we are the new master', () => {
      expect.assertions(1);
      const result = globalEffects(stateMasterWentAway, action);

      expect(result).toStrictEqual<ActionStateSetRemote>({
        type: ActionTypeRemote.StateSet,
        payload: {
          songId: 123,
          playing: false,
          currentTime: 83,
          seekTime: -1,
          master: 'my-client-name',
          activeClients: [],
          queue: [],
        },
      });
    });

    describe('when the action specified a particular client', () => {
      it('should return a StateSet action informing the new client to resume playback', () => {
        expect.assertions(1);
        const result = globalEffects(stateMasterWentAway, masterSet('other-client'));

        expect(result).toStrictEqual<ActionStateSetRemote>({
          type: ActionTypeRemote.StateSet,
          payload: {
            songId: 123,
            playing: true,
            currentTime: 83,
            seekTime: 83,
            master: 'other-client',
            activeClients: [],
            queue: [],
          },
        });
      });
    });
  });

  describe(ActionTypeLocal.ActiveClientToggled, () => {
    const action = activeClientToggled('some-client');

    describe('when the given client is active', () => {
      const stateWithGivenClientActive: GlobalState = {
        ...initialState,
        player: {
          ...initialState.player,
          activeClients: ['some-client', 'other-client'],
        },
      };

      it('should remove the given client from the active clients list', () => {
        expect.assertions(1);
        const result = globalEffects(stateWithGivenClientActive, action);

        expect(result).toStrictEqual<ActionStateSetRemote>({
          type: ActionTypeRemote.StateSet,
          payload: expect.objectContaining({
            activeClients: ['other-client'],
          }),
        });
      });
    });

    describe('when the given client is not active', () => {
      const stateWithGivenClientInactive: GlobalState = {
        ...initialState,
        player: {
          ...initialState.player,
          activeClients: ['other-client'],
        },
      };

      it('should add the given client to the active clients list', () => {
        expect.assertions(1);
        const result = globalEffects(stateWithGivenClientInactive, action);

        expect(result).toStrictEqual<ActionStateSetRemote>({
          type: ActionTypeRemote.StateSet,
          payload: expect.objectContaining({
            activeClients: expect.arrayContaining(['some-client', 'other-client']),
          }),
        });
      });
    });
  });

  describe(ActionTypeLocal.PlayPaused, () => {
    const action = playPaused();

    describe.each`
      currentClient | myClientName
      ${'master'}   | ${'some-master-client'}
      ${'a slave'}  | ${'my client'}
    `('when the current client is $currentClient', ({ myClientName }) => {
      const statePrior: GlobalState = {
        ...initialState,
        player: {
          songId: 123,
          playing: true,
          currentTime: 83,
          seekTime: 5,
          master: 'some-master-client',
          activeClients: [],
          queue: [],
        },
        myClientName,
      };

      it('should return a StateSet action informing other clients of the updated playing state', () => {
        expect.assertions(1);
        const result = globalEffects(statePrior, action);

        expect(result).toStrictEqual<ActionStateSetRemote>({
          type: ActionTypeRemote.StateSet,
          payload: {
            songId: 123,
            playing: false,
            currentTime: 83,
            seekTime: 5,
            master: 'some-master-client',
            activeClients: [],
            queue: [],
          },
        });
      });
    });
  });

  describe(ActionTypeLocal.SongInfoFetched, () => {
    const statePriorMaster: GlobalState = {
      ...initialState,
      player: {
        songId: 123,
        playing: true,
        currentTime: 83,
        seekTime: 5,
        master: 'some-master-client',
        activeClients: [],
        queue: [],
      },
      myClientName: 'some-master-client',
    };

    const action = songInfoFetched({ id: 185 } as Song, true);

    describe('when the client is master', () => {
      it('should return null', () => {
        expect.assertions(1);
        expect(globalEffects(statePriorMaster, action)).toBeNull();
      });
    });

    describe('when the client is a slave', () => {
      const stateSlave: GlobalState = {
        ...statePriorMaster,
        myClientName: 'some-slave-client',
      };

      it('should return a StateSet action informing other clients of the changed song', () => {
        expect.assertions(1);
        const result = globalEffects(stateSlave, action);

        expect(result).toStrictEqual<ActionStateSetRemote>({
          type: ActionTypeRemote.StateSet,
          payload: {
            songId: 185,
            playing: true,
            currentTime: 0,
            seekTime: 0,
            master: 'some-master-client',
            activeClients: [],
            queue: [],
          },
        });
      });

      describe('when the action is not set to replace the current song', () => {
        const actionNoReplace = songInfoFetched({ id: 185 } as Song, false);

        it('should return null', () => {
          expect.assertions(1);
          const result = globalEffects(stateSlave, actionNoReplace);
          expect(result).toBeNull();
        });
      });
    });
  });

  describe(ActionTypeLocal.QueuePushed, () => {
    const action = queuePushed([184, 79]);

    it('should add to the end of the queue', () => {
      expect.assertions(1);
      const result = globalEffects(
        {
          ...initialState,
          player: { ...initialState.player, master: 'some-master', queue: [23] },
        },
        action,
      );
      expect(result).toStrictEqual<ActionStateSetRemote>({
        type: ActionTypeRemote.StateSet,
        payload: {
          ...initialState.player,
          master: 'some-master',
          queue: [23, 184, 79],
        },
      });
    });

    describe('when the songs are already in the queue', () => {
      it('should not modify the queue', () => {
        expect.assertions(1);
        const result = globalEffects(
          {
            ...initialState,
            player: { ...initialState.player, queue: [184, 23, 79] },
          },
          action,
        );
        expect(result).toBeNull();
      });
    });
  });

  describe(ActionTypeLocal.QueueShifted, () => {
    const action = queueShifted();
    const stateWithQueue: GlobalState = {
      ...initialState,
      player: { ...initialState.player, master: 'some-master', queue: [8843, 23] },
    };

    it('should play the first song on the queue and remove it from the queue', () => {
      expect.assertions(1);
      const result = globalEffects(stateWithQueue, action);
      expect(result).toStrictEqual<ActionStateSetRemote>({
        type: ActionTypeRemote.StateSet,
        payload: {
          ...initialState.player,
          master: 'some-master',
          playing: true,
          songId: 8843,
          currentTime: 0,
          seekTime: 0,
          queue: [23],
        },
      });
    });
  });

  describe(ActionTypeLocal.QueueRemoved, () => {
    const action = queueRemoved(84);

    it('should remove the given song ID from the queue', () => {
      expect.assertions(1);
      const result = globalEffects(
        {
          ...initialState,
          player: { ...initialState.player, master: 'some-master', queue: [17, 84, 23] },
        },
        action,
      );

      expect(result).toStrictEqual<ActionStateSetRemote>({
        type: ActionTypeRemote.StateSet,
        payload: {
          ...initialState.player,
          master: 'some-master',
          queue: [17, 23],
        },
      });
    });
  });

  describe(ActionTypeLocal.QueueOrdered, () => {
    it.each`
      direction      | delta | expectedResult
      ${'forwards'}  | ${1}  | ${[17, 23, 84]}
      ${'backwards'} | ${-1} | ${[84, 17, 23]}
    `('should reorder ($direction) the given song ID', ({ delta, expectedResult }) => {
      const action = queueOrdered(84, delta);

      expect.assertions(1);
      const result = globalEffects(
        {
          ...initialState,
          player: { ...initialState.player, master: 'some-master', queue: [17, 84, 23] },
        },
        action,
      );

      expect(result).toStrictEqual<ActionStateSetRemote>({
        type: ActionTypeRemote.StateSet,
        payload: {
          ...initialState.player,
          master: 'some-master',
          queue: expectedResult,
        },
      });
    });
  });
});
