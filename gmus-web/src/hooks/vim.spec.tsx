import { act, fireEvent, render } from '@testing-library/react';
import React, { Dispatch } from 'react';

import { ActionKeyPressed, ActionTypeKeyPressed, useVimBindings } from './vim';

describe(useVimBindings.name, () => {
  const TestComponent: React.FC<{ dispatch: Dispatch<ActionKeyPressed>; skip?: boolean }> = ({
    dispatch,
    skip,
  }) => {
    useVimBindings(dispatch, skip);
    return null;
  };

  const dispatch = jest.fn();

  describe('when a key is pressed', () => {
    it('should dispatch a KeyPress action', () => {
      expect.assertions(2);
      jest.useFakeTimers();

      render(<TestComponent dispatch={dispatch} />);

      expect(dispatch).not.toHaveBeenCalled();

      act(() => {
        fireEvent.keyDown(window, {
          key: 'Tab',
        });
      });

      expect(dispatch).toHaveBeenCalledWith({ type: ActionTypeKeyPressed, key: 'Tab' });

      jest.useRealTimers();
    });
  });

  describe('when the key is unhandled', () => {
    it('should not dispatch anything', () => {
      expect.assertions(2);
      jest.useFakeTimers();
      render(<TestComponent dispatch={dispatch} />);

      expect(dispatch).not.toHaveBeenCalled();

      act(() => {
        fireEvent.keyDown(window, {
          key: '@',
        });
      });
      act(() => {
        jest.runAllTimers();
      });

      expect(dispatch).not.toHaveBeenCalled();

      jest.useRealTimers();
    });
  });

  describe('when skipping', () => {
    it('should not listen to any keys', () => {
      expect.assertions(1);
      jest.useFakeTimers();
      render(<TestComponent dispatch={dispatch} skip={true} />);

      act(() => {
        fireEvent.keyDown(window, {
          key: 'Tab',
        });
      });
      act(() => {
        jest.runAllTimers();
      });

      expect(dispatch).not.toHaveBeenCalled();

      jest.useRealTimers();
    });
  });
});
