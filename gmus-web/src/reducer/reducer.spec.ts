import {
  ActionClientListUpdated,
  ActionStateSetLocal,
  ActionStateSetRemote,
  ActionTypeLocal,
  ActionTypeRemote,
  masterSet,
  nameSet,
  seeked,
  songInfoFetched,
  stateSet,
} from '../actions';
import { Song } from '../types';
import { MusicPlayer } from '../types/state';
import { globalReducer, initialState, nullPlayer } from './reducer';
import { GlobalState } from './types';

describe(globalReducer.name, () => {
  describe(ActionTypeRemote.StateSet, () => {
    describe('when the client is master', () => {
      const stateMaster: GlobalState = {
        ...initialState,
        player: {
          ...nullPlayer,
          master: 'some-master-client',
          currentTime: 31,
          seekTime: -1,
        },
        myClientName: 'some-master-client',
      };

      describe('and the action came from a different client', () => {
        const actionFromOtherClient: ActionStateSetRemote = {
          type: ActionTypeRemote.StateSet,
          fromClient: 'other-client',
          payload: {
            songId: 123,
            playing: true,
            currentTime: 75,
            seekTime: 87,
            master: 'some-master-client',
            activeClients: [],
            queue: [],
          },
        };

        it('should update the state, including seekTime', () => {
          expect.assertions(1);
          const result = globalReducer(stateMaster, actionFromOtherClient);

          expect(result.player).toStrictEqual<MusicPlayer>({
            songId: 123,
            playing: true,
            currentTime: 75,
            seekTime: 87,
            master: 'some-master-client',
            activeClients: [],
            queue: [],
          });
        });
      });

      describe('and the action came from ourselves', () => {
        const actionFromOurselves: ActionStateSetRemote = {
          type: ActionTypeRemote.StateSet,
          fromClient: 'some-master-client',
          payload: {
            songId: 123,
            playing: true,
            currentTime: 75,
            seekTime: 87,
            master: 'some-master-client',
            activeClients: [],
            queue: [],
          },
        };

        it('should update the state, except the seekTime', () => {
          expect.assertions(1);
          const result = globalReducer(stateMaster, actionFromOurselves);

          expect(result.player).toStrictEqual<MusicPlayer>({
            songId: 123,
            playing: true,
            currentTime: 75,
            seekTime: -1,
            master: 'some-master-client',
            activeClients: [],
            queue: [],
          });
        });
      });

      describe('but will no longer be master', () => {
        const actionToSlave: ActionStateSetRemote = {
          type: ActionTypeRemote.StateSet,
          fromClient: 'other-client',
          payload: {
            songId: 123,
            playing: true,
            currentTime: 75,
            seekTime: 87,
            master: 'other-master-client',
            activeClients: [],
            queue: [],
          },
        };

        it('should update the state, setting seekTime to -1', () => {
          expect.assertions(1);
          const result = globalReducer(stateMaster, actionToSlave);

          expect(result.player).toStrictEqual<MusicPlayer>({
            songId: 123,
            playing: true,
            currentTime: 75,
            seekTime: -1,
            master: 'other-master-client',
            activeClients: [],
            queue: [],
          });
        });
      });
    });

    describe('when the client is a slave', () => {
      const stateSlave: GlobalState = {
        ...initialState,
        player: {
          ...initialState.player,
          master: 'some-master-client',
        },
        myClientName: 'my-client',
      };

      describe.each`
        case                    | fromClient
        ${'the master client'}  | ${'some-master-client'}
        ${'a different client'} | ${'other-client'}
      `('and the action came from $case', ({ fromClient }) => {
        const action: ActionStateSetRemote = {
          type: ActionTypeRemote.StateSet,
          fromClient,
          payload: {
            songId: 123,
            playing: true,
            currentTime: 75,
            seekTime: 87,
            master: 'some-master-client',
            activeClients: [],
            queue: [],
          },
        };

        it('should set the player state, except seekTime', () => {
          expect.assertions(1);
          const result = globalReducer(stateSlave, action);

          expect(result.player).toStrictEqual<MusicPlayer>({
            songId: 123,
            playing: true,
            currentTime: 75,
            seekTime: -1,
            master: 'some-master-client',
            activeClients: [],
            queue: [],
          });
        });
      });

      describe('but will be set to master', () => {
        const actionToMaster: ActionStateSetRemote = {
          type: ActionTypeRemote.StateSet,
          fromClient: 'other-client',
          payload: {
            songId: 123,
            playing: true,
            currentTime: 75,
            seekTime: 87,
            master: 'my-client',
            activeClients: [],
            queue: [],
          },
        };

        it('should set the player state, including seekTime', () => {
          expect.assertions(1);
          const result = globalReducer(stateSlave, actionToMaster);

          expect(result.player).toStrictEqual<MusicPlayer>({
            songId: 123,
            playing: true,
            currentTime: 75,
            seekTime: 87,
            master: 'my-client',
            activeClients: [],
            queue: [],
          });
        });
      });
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

  describe(ActionTypeLocal.NameSet, () => {
    it('should set the name', () => {
      expect.assertions(1);

      expect(globalReducer(initialState, nameSet('foo')).myClientName).toBe('foo');
    });
  });

  describe(ActionTypeLocal.StateSet, () => {
    const action = stateSet({
      songId: 123,
      playing: true,
      currentTime: 75,
      seekTime: 87,
      master: 'some-master-client',
    });

    describe('when the client is master', () => {
      const stateMaster: GlobalState = {
        ...initialState,
        player: {
          ...nullPlayer,
          master: 'some-master-client',
          currentTime: 31,
          seekTime: -1,
        },
        myClientName: 'some-master-client',
      };

      it('should set the player state optimistically', () => {
        expect.assertions(1);
        const result = globalReducer(stateMaster, action);

        expect(result.player).toStrictEqual<MusicPlayer>({
          songId: 123,
          playing: true,
          currentTime: 75,
          seekTime: 87,
          master: 'some-master-client',
          activeClients: [],
          queue: [],
        });
      });

      describe('when the state update is partial', () => {
        const actionPartial: ActionStateSetLocal = stateSet({
          songId: 3,
          playing: true,
        });

        it('should update the given part of the state', () => {
          expect.assertions(1);

          const result = globalReducer(stateMaster, actionPartial);

          expect(result.player).toStrictEqual<MusicPlayer>({
            ...nullPlayer,
            master: 'some-master-client',
            currentTime: 31,
            seekTime: -1,
            songId: 3,
            playing: true,
          });
        });
      });
    });

    describe('when the client is a slave', () => {
      const stateSlave: GlobalState = {
        ...initialState,
        player: {
          ...initialState.player,
          master: 'some-master-client',
        },
        myClientName: 'my-client',
      };

      it('should not update the state optimistically', () => {
        expect.assertions(1);
        const result = globalReducer(stateSlave, action);

        expect(result.player).toBe(stateSlave.player);
      });

      describe('but will be master', () => {
        const actionToMaster = stateSet({
          master: 'my-client',
        });

        it('should set the seekTime to the currentTime value', () => {
          expect.assertions(1);
          const result = globalReducer(stateSlave, actionToMaster);

          expect(result.player.seekTime).toBe(stateSlave.player.currentTime);
        });
      });
    });
  });

  describe(ActionTypeLocal.Seeked, () => {
    const action = seeked(173);

    describe('when the client is master', () => {
      const stateMaster: GlobalState = {
        ...initialState,
        player: {
          songId: 123,
          playing: true,
          currentTime: 31,
          seekTime: -1,
          master: 'some-master-client',
          activeClients: [],
          queue: [],
        },
        myClientName: 'some-master-client',
      };

      it('should set the current and seek time', () => {
        expect.assertions(1);
        const result = globalReducer(stateMaster, action);

        expect(result.player).toStrictEqual<MusicPlayer>({
          songId: 123,
          playing: true,
          currentTime: 173,
          seekTime: 173,
          master: 'some-master-client',
          activeClients: [],
          queue: [],
        });
      });
    });

    describe('when the client is a slave', () => {
      const stateSlave: GlobalState = {
        ...initialState,
        player: {
          ...initialState.player,
          seekTime: 101,
          master: 'some-master-client',
        },
        myClientName: 'my-client',
      };

      it('should only set the current time (optimistically)', () => {
        expect.assertions(2);
        const result = globalReducer(stateSlave, action);

        expect(result.player.seekTime).toBe(stateSlave.player.seekTime);
        expect(result.player.currentTime).toBe(173);
      });
    });
  });

  describe(ActionTypeLocal.MasterSet, () => {
    const action = masterSet();

    const stateBefore: GlobalState = {
      ...initialState,
      myClientName: 'my-client',
      player: {
        songId: 174,
        playing: true,
        master: 'some-master-client',
        currentTime: 13,
        seekTime: -1,
        activeClients: [],
        queue: [],
      },
    };

    it('should set the master player to the current client', () => {
      expect.assertions(1);
      const result = globalReducer(stateBefore, action);
      expect(result.player.master).toBe('my-client');
    });

    it('should seek to the current time', () => {
      expect.assertions(1);
      const result = globalReducer(stateBefore, action);
      expect(result.player.seekTime).toBe(13);
    });

    it('should pause the client', () => {
      expect.assertions(1);
      const result = globalReducer(stateBefore, action);
      expect(result.player.playing).toBe(false);
    });

    describe('when a particular client is given in the action', () => {
      const actionToOtherClient = masterSet('other-client');

      it('should set the master player to the given client', () => {
        expect.assertions(2);
        const result = globalReducer(stateBefore, actionToOtherClient);
        expect(result.player.master).toBe('other-client');
        expect(result.player.seekTime).toBe(stateBefore.player.currentTime);
      });

      it('should not pause the client', () => {
        expect.assertions(1);
        const result = globalReducer(stateBefore, actionToOtherClient);
        expect(result.player.playing).toBe(true);
      });
    });
  });

  describe(ActionTypeLocal.SongInfoFetched, () => {
    const song: Song = {
      id: 123,
      track: 17,
      title: 'Some song',
      artist: 'Some artist',
      album: 'Some album',
      time: 214,
    };

    const action = songInfoFetched(song);

    it('should set the song info in state', () => {
      expect.assertions(1);
      const result = globalReducer(initialState, action);
      expect(result.songInfo).toStrictEqual<Song>(song);
    });

    describe('when set to replace the current song', () => {
      const actionReplace = songInfoFetched(song, true);

      it('should play the given song from the start', () => {
        expect.assertions(4);
        const result = globalReducer(initialState, actionReplace);

        expect(result.songInfo).toStrictEqual<Song>(song);
        expect(result.player.playing).toBe(true);
        expect(result.player.songId).toBe(song.id);
        expect(result.player.seekTime).toBe(0);
      });
    });
  });
});
