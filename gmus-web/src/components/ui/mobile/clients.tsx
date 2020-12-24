import { rem } from 'polished';
import React, { useCallback, useContext, useMemo } from 'react';
import styled from 'styled-components';
import { masterSet } from '../../../actions';

import { DispatchContext, StateContext } from '../../../context/state';
import { Member } from '../../../types';

const Container = styled.ul`
  flex: 1;
  list-style: none;
  margin: ${rem(8)};
  min-width: 60%;
  padding: 0;
`;

type ClientProps = {
  isMaster: boolean;
  isUs: boolean;
  isPaused: boolean;
};

const Client = styled.li<ClientProps>`
  align-items: center;
  background: ${({ isMaster }): string => (isMaster ? 'white' : '#ececec')};
  border-radius: ${rem(4)};
  display: flex;
  height: ${rem(32)};
  justify-content: center;
  margin: 0 0 ${rem(4)} 0;
  padding: 0 ${rem(16)};

  button {
    appearance: none;
    background: none;
    border: none;
    font-style: inherit;
    font-weight: inherit;
    height: 100%;
    outline: none;
    width: 100%;
  }
`;

const ClientMeta = styled.div`
  flex: 0 0 ${rem(32)};
  white-space: nowrap;
`;

export const ClientList: React.FC = () => {
  const state = useContext(StateContext);
  const dispatch = useContext(DispatchContext);

  const onSwitchClient = useCallback(
    (client: string) => {
      dispatch(masterSet(client));
    },
    [dispatch],
  );

  const sortedClientList = useMemo<Member[]>(
    () => state.clientList.slice().sort((a, b) => (a.name < b.name ? -1 : 1)),
    [state.clientList],
  );

  return (
    <Container>
      {sortedClientList.map(({ name }) => (
        <Client
          key={name}
          isMaster={name === state.player.master}
          isUs={name === state.myClientName}
          isPaused={!state.player.playing}
          onClick={(): void => onSwitchClient(name)}
        >
          <button onClick={(): void => onSwitchClient(name)}>{name}</button>
          <ClientMeta>
            {name === state.player.master && (state.player.playing ? '🔊' : '🔈')}
            {name === state.myClientName ? '🏠' : '📶'}
          </ClientMeta>
        </Client>
      ))}
    </Container>
  );
};
