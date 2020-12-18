import { rem } from 'polished';
import { CSSProperties } from 'react';
import styled from 'styled-components';

export const Container = styled.div`
  align-items: center;
  background: #39005d;
  color: white;
  display: flex;
  flex-flow: column;
  font-family: Hack, monospace;
  height: 100%;
  justify-content: center;
  position: absolute;
  width: 100%;

  input,
  button {
    outline: none;

    &:focus {
      border-color: #f55a00;
    }
  }
`;

export const Title = styled.h1`
  align-items: center;
  display: flex;
  font-size: ${rem(24)};
  margin-bottom: ${rem(16)};
`;

export const Instruction = styled.p`
  font-size: ${rem(16)};
  margin-bottom: ${rem(8)};
`;

export const InputGroup = styled.div`
  display: flex;
`;

export const Loader = styled.div<{ visible: boolean }>`
  margin: ${rem(24)} 0;
  visibility: ${({ visible }): CSSProperties['visibility'] => (visible ? 'visible' : 'hidden')};
`;
