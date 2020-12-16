import { act, fireEvent, render } from '@testing-library/react';
import React, { Dispatch } from 'react';

import { ActionKeyPressed, ActionTypeKeyPressed, useVimBindings } from './vim';

describe(useVimBindings.name, () => {
  const TestComponent: React.FC<{ dispatch: Dispatch<ActionKeyPressed> }> = ({ dispatch }) => {
    useVimBindings(dispatch);
    return null;
  };

  const dispatch = jest.fn();

  describe('when a key is pressed', () => {
    it('should dispatch a KeyPress action', () => {
      expect.assertions(2);
      render(<TestComponent dispatch={dispatch} />);

      expect(dispatch).not.toHaveBeenCalled();

      act(() => {
        fireEvent.keyDown(window, {
          key: 'Tab',
        });
      });

      expect(dispatch).toHaveBeenCalledWith({ type: ActionTypeKeyPressed, key: 'Tab' });
    });
  });

  describe('when the key is unhandled', () => {
    it('should not dispatch anything', () => {
      expect.assertions(2);
      render(<TestComponent dispatch={dispatch} />);

      expect(dispatch).not.toHaveBeenCalled();

      act(() => {
        fireEvent.keyDown(window, {
          key: '@',
        });
      });

      expect(dispatch).not.toHaveBeenCalled();
    });
  });
});
