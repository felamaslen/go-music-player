import React from 'react';
import { H3 } from '../styled/typography';
import { HelpDialogContainer } from './help.styles';

export const DisconnectedDialog: React.FC = () => (
  <HelpDialogContainer>
    <H3>Disconnected</H3>
    <p>We will automatically try to reconnect.</p>
  </HelpDialogContainer>
);
