import { CmusUIProvider } from './cmus';
import { UIProvider, UIProviders } from './types';

export const uiProviders: UIProviders = {
  [UIProvider.Cmus]: CmusUIProvider,
};
