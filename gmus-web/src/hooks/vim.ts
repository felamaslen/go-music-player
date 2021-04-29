import { useThrottleCallback } from '@react-hook/throttle';
import { Dispatch, useCallback, useEffect } from 'react';

import { noop } from '../utils/noop';

export const Keys = {
  tab: 'Tab',
  enter: 'Enter',
  esc: 'Escape',
  space: ' ',
  colon: ':',
  question: '?',
  pageDown: 'PageDown',
  pageUp: 'PageUp',
  slash: '/',
  '1': '1',
  '2': '2',
  '3': '3',
  B: 'b',
  C: 'c',
  D: 'd',
  E: 'e',
  J: 'j',
  K: 'k',
  P: 'P',
  p: 'p',
  S: 's',
  Z: 'z',
};

const availableKeys = Object.values(Keys);

export const ActionTypeKeyPressed = '@@vim/KEY_PRESSED';

export type ActionKeyPressed = {
  type: typeof ActionTypeKeyPressed;
  key: string;
};

export function useVimBindings(dispatch: Dispatch<ActionKeyPressed>, skip = false): void {
  const listener = useCallback(
    (event: KeyboardEvent): void => {
      if (!availableKeys.includes(event.key)) {
        return;
      }

      event.preventDefault();

      const action: ActionKeyPressed = { type: ActionTypeKeyPressed, key: event.key };
      dispatch(action);
    },
    [dispatch],
  );

  const listenerThrottled = useThrottleCallback(
    listener,
    process.env.NODE_ENV === 'development' ? 15 : 60,
    true,
  );

  useEffect(() => {
    if (skip) {
      return noop;
    }

    window.addEventListener('keydown', listenerThrottled);
    return (): void => {
      window.removeEventListener('keydown', listenerThrottled);
    };
  }, [skip, listenerThrottled]);
}
