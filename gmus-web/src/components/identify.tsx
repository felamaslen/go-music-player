import React, { useCallback, useEffect, useRef, useState } from 'react';
import { CircleLoader } from 'react-spinners';
import { useCTA } from '../hooks/cta';

import * as Styled from './identify.styles';

export type Props = {
  connecting: boolean;
  onIdentify: (name: string) => void;
  setInteracted: (interacted: boolean) => void;
};

export const LoadingWrapper: React.FC = () => (
  <Styled.Container>
    <CircleLoader size={100} color="white" />
  </Styled.Container>
);

export const Identify: React.FC<Props> = ({ connecting, onIdentify, setInteracted }) => {
  const [name, setName] = useState<string>('');
  const onChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => setName(event.target.value),
    [],
  );
  const onConnect = useCallback(() => {
    onIdentify(name);
    setInteracted(true);
  }, [name, onIdentify, setInteracted]);

  const input = useRef<HTMLInputElement>(null);
  useEffect(() => {
    setImmediate(() => {
      input.current?.focus();
    });
  }, []);

  const inputOnKeydown = useCallback(
    (event: React.KeyboardEvent<HTMLInputElement>) => {
      if (event.key === 'Enter') {
        onConnect();
      }
    },
    [onConnect],
  );
  const buttonHandlers = useCTA(onConnect);

  if (connecting) {
    return <LoadingWrapper />;
  }

  return (
    <Styled.Container>
      <Styled.Title>go-music-player</Styled.Title>
      <Styled.Instruction>Set client name:</Styled.Instruction>
      <Styled.InputGroup>
        <input ref={input} type="text" onChange={onChange} onKeyDown={inputOnKeydown} />
        <button disabled={connecting} {...buttonHandlers}>
          Connect
        </button>
      </Styled.InputGroup>
    </Styled.Container>
  );
};
