import { rem } from 'polished';
import styled, { keyframes } from 'styled-components';

const spin = keyframes`
  0% { content: '⣾' }
  14.2857% { content: '⣽' }
  28.5714% { content: '⣻' }
  42.8571% { content: '⢿' }
  57.1429% { content: '⡿' }
  71.4286% { content: '⣟' }
  85.7143% { content: '⣯' }
  100% { content: '⣷' }
`;

export const AsciiSpinner = styled.span`
  &::after {
    animation: 1s ${spin} infinite;
    animation-timing-function: step-end;
    color: inherit;
    content: '';
    display: inline;
    font-family: Hack, monospace;
    height: ${rem(16)};
    line-height: ${rem(16)};
    margin-right: ${rem(8)};
    width: auto;
  }
`;
