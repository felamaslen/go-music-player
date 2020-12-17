import { Dispatch, useEffect } from 'react';

export const Keys = {
  tab: 'Tab',
  enter: 'Enter',
  esc: 'Escape',
  space: ' ',
  colon: ':',
  '1': '1',
  J: 'j',
  K: 'k',
};

const availableKeys = Object.values(Keys);

export const ActionTypeKeyPressed = '@@vim/KEY_PRESSED';

export type ActionKeyPressed = {
  type: typeof ActionTypeKeyPressed;
  key: string;
};

export function useVimBindings(dispatch: Dispatch<ActionKeyPressed>, skip = false): void {
  useEffect(() => {
    if (skip) {
      return (): void => {
        // pass
      };
    }

    const listener = (event: KeyboardEvent): void => {
      if (!availableKeys.includes(event.key)) {
        return;
      }

      event.preventDefault();

      const action: ActionKeyPressed = { type: ActionTypeKeyPressed, key: event.key };
      dispatch(action);
    };

    window.addEventListener('keydown', listener);
    return (): void => {
      window.removeEventListener('keydown', listener);
    };
  }, [dispatch, skip]);
}
