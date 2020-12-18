import { lazy } from 'react';
import { UIProvider, UIProviders } from './types';

export const uiProviders: UIProviders = {
  [UIProvider.Cmus]: lazy(() => import('./cmus')),
};
