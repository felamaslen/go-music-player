import React from 'react';

export function namedMemo<P extends Record<string, unknown>>(
  componentName: string,
  Component: React.FC<P>,
): React.FC<P> {
  const NamedComponent = Component;
  NamedComponent.displayName = componentName;
  return React.memo<P>(NamedComponent);
}
