import React, { useCallback, useEffect, useRef } from 'react';
import { useCTA } from '../hooks/cta';
import { Container } from './identify.styles';

export type Props = {
  setInteracted: (interacted: boolean) => void;
};

export const Interact: React.FC<Props> = ({ setInteracted }) => {
  const onInteract = useCallback(() => setInteracted(true), [setInteracted]);
  const ctaProps = useCTA(onInteract);

  const button = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    button.current?.focus();
  }, []);

  return (
    <Container>
      <button {...ctaProps} ref={button}>
        Continue
      </button>
    </Container>
  );
};
