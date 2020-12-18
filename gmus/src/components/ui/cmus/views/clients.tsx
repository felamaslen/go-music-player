import React, { useCallback, useContext, useEffect, useMemo, useRef } from 'react';

import { StateContext } from '../../../../context/state';
import { Member } from '../../../../types';
import { scrollThroughItems } from '../../../../utils/delta';
import { clientActivated } from '../actions';
import { CmusUIDispatchContext, CmusUIStateContext } from '../reducer';
import { H3 } from '../styled/typography';
import { lineHeight } from '../utils/scroll';

import * as Styled from './clients.styles';

type ClientRowProps = {
  name: string;
  active: boolean;
  isMe: boolean;
  isMaster: boolean;
  isPaused: boolean;
};

const ClientRow: React.FC<ClientRowProps> = ({ name, active, isMe, isMaster, isPaused }) => (
  <Styled.Client highlight={isMaster} active={active} parentActive={true}>
    <Styled.ClientName>{name}</Styled.ClientName>
    {isMaster && (isPaused ? '🔈' : '🔊')}
    {isMe ? '🏠' : '📶'}
  </Styled.Client>
);

export const ViewClientList: React.FC = () => {
  const {
    clientList,
    myClientName,
    player: { master, playing },
  } = useContext(StateContext);

  const dispatchUI = useContext(CmusUIDispatchContext);
  const {
    scroll,
    clientList: { active: activeClient },
  } = useContext(CmusUIStateContext);

  const ref = useRef<HTMLDivElement>(null);

  const sortedClientList = useMemo<Member[]>(
    () => clientList.slice().sort((a, b) => (a.name < b.name ? -1 : 1)),
    [clientList],
  );

  const setActiveClient = useCallback((name: string) => dispatchUI(clientActivated(name)), [
    dispatchUI,
  ]);

  const onScroll = useCallback(
    (delta: -1 | 1): void => {
      setActiveClient(
        scrollThroughItems(sortedClientList, (compare) => compare.name === activeClient, delta)
          .name,
      );

      if (ref.current) {
        ref.current.scrollTop += delta * lineHeight;
      }
    },
    [sortedClientList, activeClient, setActiveClient],
  );

  const lastScrollSerial = useRef<number>(0);
  useEffect(() => {
    if (scroll.delta !== 0 && scroll.serialNumber !== lastScrollSerial.current) {
      lastScrollSerial.current = scroll.serialNumber;
      onScroll(scroll.delta > 0 ? 1 : -1);
    }
  }, [scroll, onScroll]);

  return (
    <Styled.Container>
      <H3>Client list</H3>
      <Styled.List ref={ref}>
        {sortedClientList.map(({ name }) => (
          <ClientRow
            key={name}
            name={name}
            active={name === activeClient}
            isMe={name === myClientName}
            isMaster={name === master}
            isPaused={!playing}
          />
        ))}
      </Styled.List>
    </Styled.Container>
  );
};
