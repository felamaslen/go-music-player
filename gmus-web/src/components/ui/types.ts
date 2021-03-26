import React from 'react';

import { Song } from '../../types';

export enum UIProvider {
  Cmus = 'Cmus',
  Mobile = 'Mobile',
}

export type UIProps = {
  connecting: boolean;
  ready: boolean;
  error: boolean;
  isMaster: boolean;
  currentSong: Song | null;
  nextSong: () => void;
  prevSong: () => void;
};

export type UIProviderComponent = React.FC<UIProps>;

export type UIProviders = Record<UIProvider, UIProviderComponent>;
