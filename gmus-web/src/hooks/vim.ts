import { useThrottleCallback } from '@react-hook/throttle';
import { Dispatch, useCallback, useEffect } from 'react';

export const Keys = {
  tab: 'Tab',
  enter: 'Enter',
  esc: 'Escape',
  space: ' ',
  colon: ':',
  question: '?',
  pageDown: 'PageDown',
  pageUp: 'PageUp',
  '1': '1',
  '2': '2',
  B: 'b',
  C: 'c',
  J: 'j',
  K: 'k',
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

  const listenerThrottled = useThrottleCallback(listener, 20, true);

  useEffect(() => {
    if (skip) {
      return (): void => {
        // pass
      };
    }

    window.addEventListener('keydown', listenerThrottled);
    return (): void => {
      window.removeEventListener('keydown', listenerThrottled);
    };
  }, [skip, listenerThrottled]);
}
