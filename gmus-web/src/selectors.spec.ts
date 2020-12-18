import { ActionTypeRemote, stateSet } from './actions';
import { GlobalState, initialState } from './reducer';
import { isFromOurselves, isMaster, willBeMaster } from './selectors';

describe(isMaster.name, () => {
  describe('when the master player is the current client', () => {
    it('should return true', () => {
      expect.assertions(1);
      expect(
        isMaster({
          player: { ...initialState.player, master: 'my-client-name' },
          myClientName: 'my-client-name',
        }),
      ).toBe(true);
    });
  });

  describe('when the master player is not the current client', () => {
    it('should return false', () => {
      expect.assertions(1);
      expect(
        isMaster({
          player: { ...initialState.player, master: 'other-client-name' },
          myClientName: 'my-client-name',
        }),
      ).toBe(false);
    });
  });

  describe('when there is no master player', () => {
    it('should return false', () => {
      expect.assertions(1);
      expect(
        isMaster({
          player: { ...initialState.player, master: '' },
          myClientName: 'my-client-name',
        }),
      ).toBe(false);
    });
  });
});

describe(isFromOurselves.name, () => {
  describe('when an action was dispatched from the current client', () => {
    it('should return true', () => {
      expect.assertions(1);
      expect(
        isFromOurselves(
          { myClientName: 'my-client-name' },
          {
            type: ActionTypeRemote.StateSet,
            fromClient: 'my-client-name',
            payload: {} as GlobalState,
          },
        ),
      ).toBe(true);
    });
  });

  describe('when an action was dispatched from a different client', () => {
    it('should return false', () => {
      expect.assertions(1);
      expect(
        isFromOurselves(
          { myClientName: 'my-client-name' },
          {
            type: ActionTypeRemote.StateSet,
            fromClient: 'some-other-client-name',
            payload: {} as GlobalState,
          },
        ),
      ).toBe(false);
    });
  });

  describe('when an action was not dispatched from a client', () => {
    it('should return false', () => {
      expect.assertions(1);
      expect(
        isFromOurselves(
          { myClientName: 'my-client-name' },
          {
            type: ActionTypeRemote.StateSet,
            fromClient: null,
            payload: {} as GlobalState,
          },
        ),
      ).toBe(false);
    });
  });
});

describe(willBeMaster.name, () => {
  describe('when the action will cause the current client to be master', () => {
    it('should return true', () => {
      expect.assertions(1);
      expect(
        willBeMaster({ myClientName: 'a-slave-client' }, stateSet({ master: 'a-slave-client' })),
      ).toBe(true);
    });
  });

  describe('when the action will not change the master', () => {
    it('should return false', () => {
      expect.assertions(1);
      expect(willBeMaster({ myClientName: 'a-slave-client' }, stateSet({ seekTime: 123 }))).toBe(
        false,
      );
    });

    describe('but the current client is already master', () => {
      it('should still return false', () => {
        expect.assertions(1);
        expect(
          willBeMaster(
            { myClientName: 'a-client', player: { ...initialState.player, master: 'a-client' } },
            stateSet({ seekTime: 123 }),
          ),
        ).toBe(false);
      });
    });
  });
});
