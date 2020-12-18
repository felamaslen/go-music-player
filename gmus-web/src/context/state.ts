import { createContext, Dispatch } from 'react';
import { LocalAction } from '../actions';

import { GlobalState, initialState } from '../reducer';

export const StateContext = createContext<GlobalState>(initialState);

export const nullDispatch: Dispatch<unknown> = (): void => {
  // pass
};

export const DispatchContext = createContext<Dispatch<LocalAction>>(nullDispatch);
