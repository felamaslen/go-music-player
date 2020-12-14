import React, { ReactEventHandler, useMemo } from 'react';

export const isEnter = (event: KeyboardEvent | React.KeyboardEvent): boolean =>
  event.key === 'Enter';

type Options = {
  stopPropagation?: boolean;
};

export function useCTA<E extends HTMLElement = HTMLElement>(
  onActivate: () => void,
  options?: Options,
): {
  onClick: ReactEventHandler<E>;
  onKeyDown: ReactEventHandler<E>;
} {
  const stopPropagation = !!options?.stopPropagation;
  const events = useMemo(
    () => ({
      onKeyDown: (event: React.KeyboardEvent<E>): void => {
        if (isEnter(event)) {
          onActivate();
        }
      },
      onClick: (event: React.MouseEvent<E>): void => {
        if (stopPropagation) {
          event.stopPropagation();
        }
        onActivate();
      },
    }),
    [onActivate, stopPropagation],
  );

  return events;
}
