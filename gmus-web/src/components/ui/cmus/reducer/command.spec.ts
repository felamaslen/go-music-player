import { loggedOut } from '../../../../actions';
import { CmusUIActionType, commandSet } from '../actions';

import { stateCommandMode } from './fixtures';
import { cmusUIReducer } from './reducer';

describe(CmusUIActionType.CommandSet, () => {
  describe('q', () => {
    const action = commandSet('q');

    it('should set a log out global action', () => {
      expect.assertions(2);
      const result = cmusUIReducer(stateCommandMode, action);
      expect(result.commandMode).toBe(false);
      expect(result.globalAction).toStrictEqual(loggedOut());
    });
  });
});
