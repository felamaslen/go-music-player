import React, { useCallback } from 'react';

import { useCTA } from '../../hooks/cta';
import { Member } from '../../types/state';

export type Props = {
  myClientName: string;
  clients: Member[];
};

type PropsListItem = {
  name: string;
  onSelect: (name: string) => void;
};

const ClientListItem: React.FC<PropsListItem> = ({ name, onSelect }) => {
  const onActivate = useCallback(() => {
    onSelect(name);
  }, [onSelect, name]);

  const eventProps = useCTA(onActivate);

  return <li {...eventProps}>{name}</li>;
};

export const ClientList: React.FC<Props> = ({ myClientName, clients }) => {
  const onSelectClient = useCallback((name: string) => {
    console.log('Selected client!', name);
    // TODO
  }, []);

  return (
    <div>
      <h5>Client list</h5>
      <h6>My name: {myClientName}</h6>
      <ul>
        {clients.map(({ name }) => (
          <ClientListItem key={name} name={name} onSelect={onSelectClient} />
        ))}
      </ul>
    </div>
  );
};
