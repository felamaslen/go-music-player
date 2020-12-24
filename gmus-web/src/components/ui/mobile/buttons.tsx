import { rem } from 'polished';
import React from 'react';
import styled from 'styled-components';

export type Props = {
  playing: boolean;
  onPrev: () => void;
  onPlayPause: () => void;
  onNext: () => void;
};

const buttonColor = 'white';

const Container = styled.div`
  box-sizing: border-box;
  display: flex;
  padding: ${rem(8)} ${rem(32)};
  width: 100%;
`;

const Button = styled.button`
  appearance: none;
  background: none;
  display: flex;
  flex: 3;
  flex-flow: column;
  justify-content: center;
  border: none;
  outline: none;

  svg {
    border: 2px solid ${buttonColor};
    border-radius: 100%;
    flex: 0 0 auto;
    width: 100%;
  }
`;

const PlayPauseButton = styled(Button)`
  flex: 4;
`;

export const Buttons: React.FC<Props> = ({ onPrev, onPlayPause, onNext, playing }) => (
  <Container>
    <Button onClick={onPrev}>
      <svg viewBox="0 0 100 100" preserveAspectRatio="xMinYMin">
        <path d="M48,50 L48,20 L14,50 L48,80 L48,50" stroke="none" fill={buttonColor} />
        <path d="M78,50 L78,20 L46,50 L78,80 L78,50" stroke="none" fill={buttonColor} />
      </svg>
    </Button>
    <PlayPauseButton onClick={onPlayPause}>
      <svg viewBox="0 0 100 100">
        {playing && (
          <>
            <path d="M33,50 L33,28 L45,28 L45,72 L33,72 L33,50" stroke="none" fill={buttonColor} />
            <path d="M55,50 L55,28 L67,28 L67,72 L55,72 L55,50" stroke="none" fill={buttonColor} />
          </>
        )}
        {!playing && (
          <path d="M36,50 L36,20 L76,50 L36,80 L36,50" stroke="none" fill={buttonColor} />
        )}
      </svg>
    </PlayPauseButton>
    <Button onClick={onNext}>
      <svg viewBox="0 0 100 100">
        <path d="M22,50 L22,20 L56,50 L22,80 L22,50" stroke="none" fill={buttonColor} />
        <path d="M54,50 L54,20 L86,50 L54,80 L54,50" stroke="none" fill={buttonColor} />
      </svg>
    </Button>
  </Container>
);
