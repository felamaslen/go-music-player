import React from 'react';

import { useSocket } from '../../hooks/socket';
import { Gmus } from '../gmus';
import { Identify } from '../identify';

export const Root: React.FC = () => {
  const { name, onIdentify, socket, connecting, connected, error } = useSocket();

  if (!(socket && connected && name) || error) {
    return <Identify connecting={connecting} onIdentify={onIdentify} />;
  }

  return <Gmus myClientName={name} socket={socket} />;
};
