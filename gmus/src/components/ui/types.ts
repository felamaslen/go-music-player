import React from 'react';

export enum UIProvider {
  Cmus = 'Cmus',
}

export type UIProps = {
  isMaster: boolean;
};

export type UIProviderComponent = React.FC<UIProps>;

export type UIProviders = Record<UIProvider, UIProviderComponent>;
