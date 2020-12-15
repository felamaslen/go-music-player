import { GlobalState } from './types';

export * from './reducer';
export * from './types';

export function init(state: GlobalState): GlobalState {
  return state;
}
