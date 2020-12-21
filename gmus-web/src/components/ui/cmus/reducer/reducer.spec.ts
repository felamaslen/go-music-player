import { Song } from '../../../../types';
import { clientActivated, CmusUIActionType, queueInfoLoaded } from '../actions';
import { cmusUIReducer, initialCmusUIState } from './reducer';

describe(CmusUIActionType.ClientActivated, () => {
  const action = clientActivated('some-client');

  it('should set the active client', () => {
    expect.assertions(1);
    const result = cmusUIReducer(initialCmusUIState, action);
    expect(result.clientList.active).toBe('some-client');
  });
});

describe(CmusUIActionType.QueueInfoLoaded, () => {
  const action = queueInfoLoaded([{ id: 176 } as Song]);

  it('should set the queue info', () => {
    expect.assertions(1);
    const result = cmusUIReducer(initialCmusUIState, action);
    expect(result.queue.info).toStrictEqual([{ id: 176 }]);
  });
});
