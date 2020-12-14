import { ActionStateSetRemote, ActionTypeLocal, ActionTypeRemote, stateSet } from '../actions';
import { MusicPlayer } from '../types/state';
import { globalEffects } from './effects';

describe(globalEffects.name, () => {
  describe(ActionTypeLocal.StateSet, () => {
    it('should create a remote state set action', () => {
      expect.assertions(1);

      const localPlayer: MusicPlayer = {
        songId: 123,
        playing: false,
        playTimeSeconds: 83,
        currentClient: 'my-client',
      };

      const result = globalEffects(stateSet(localPlayer));

      expect(result).toStrictEqual<ActionStateSetRemote>({
        type: ActionTypeRemote.StateSet,
        payload: localPlayer,
      });
    });
  });
});
