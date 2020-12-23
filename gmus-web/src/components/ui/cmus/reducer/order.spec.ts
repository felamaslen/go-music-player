import { queueOrdered } from '../../../../actions';
import { ActionKeyPressed, ActionTypeKeyPressed, Keys } from '../../../../hooks/vim';
import { stateQueue } from './fixtures';
import { cmusUIReducer } from './reducer';

describe('Order actions', () => {
  describe(Keys.p, () => {
    const action: ActionKeyPressed = { type: ActionTypeKeyPressed, key: Keys.p };

    describe('when on the queue view', () => {
      it('should set a global action to move the song down the queue', () => {
        expect.assertions(1);
        const result = cmusUIReducer(
          { ...stateQueue, queue: { ...stateQueue.queue, active: 75 } },
          action,
        );
        expect(result.globalAction).toStrictEqual(queueOrdered(75, 1));
      });
    });
  });

  describe(Keys.P, () => {
    const action: ActionKeyPressed = { type: ActionTypeKeyPressed, key: Keys.P };

    describe('when on the queue view', () => {
      it('should set a global action to move the song up the queue', () => {
        expect.assertions(1);
        const result = cmusUIReducer(
          { ...stateQueue, queue: { ...stateQueue.queue, active: 75 } },
          action,
        );
        expect(result.globalAction).toStrictEqual(queueOrdered(75, -1));
      });
    });
  });
});
