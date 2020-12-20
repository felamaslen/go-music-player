import { clientActivated, CmusUIActionType } from '../actions';
import { cmusUIReducer, initialCmusUIState } from './reducer';

describe(CmusUIActionType.ClientActivated, () => {
  const action = clientActivated('some-client');

  it('should set the active client', () => {
    expect.assertions(1);
    const result = cmusUIReducer(initialCmusUIState, action);
    expect(result.clientList.active).toBe('some-client');
  });
});
