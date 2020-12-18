import React from 'react';

import { Song } from '../../types';

export enum UIProvider {
  Cmus = 'Cmus',
}

export type UIProps = {
  isMaster: boolean;
  currentSong: Song | null;
};

export type UIProviderComponent = React.FC<UIProps>;

export type UIProviders = Record<UIProvider, UIProviderComponent>;
