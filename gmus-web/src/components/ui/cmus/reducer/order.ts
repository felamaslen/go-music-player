import { queueOrdered } from '../../../../actions';
import { CmusUIState, View } from '../types';
import { withGlobalAction } from './utils';

export function handleOrder(state: CmusUIState, delta: -1 | 1): CmusUIState {
  switch (state.view) {
    case View.Queue:
      if (!state.queue.active) {
        return state;
      }
      return withGlobalAction(state, queueOrdered(state.queue.active, delta));

    default:
      return state;
  }
}
