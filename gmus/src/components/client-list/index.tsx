import React, { useCallback } from 'react';
import { useCTA } from '../../hooks/cta';

export type Props = {
  clients: string[];
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

export const ClientList: React.FC<Props> = ({ clients }) => {
  const onSelectClient = useCallback((name: string) => {
    console.log('Selected client!', name);
    // TODO
  }, []);

  return (
    <div>
      <h6>Client list</h6>
      <ul>
        {clients.map((name) => (
          <ClientListItem key={name} name={name} onSelect={onSelectClient} />
        ))}
      </ul>
    </div>
  );
};
