import { rem } from 'polished';
import styled from 'styled-components';

import { FlexRow } from '../styled/layout';
import { colors } from '../styled/variables';

export const CommandWrapper = styled(FlexRow)`
  background: ${colors.background};
  color: ${colors.foreground};
  flex: 0 0 ${rem(16)};
  white-space: nowrap;

  input {
    border: none;
    color: transparent;
    flex: 1;
    font: inherit;
    background: transparent;
    line-height: inherit;
    outline: none;
    margin: 0;
    padding: 0;
    text-shadow: 0 0 1px ${colors.foreground};
  }
`;

export const Before = styled.span<{ active: boolean }>`
  color: ${({ active }): string => (active ? colors.foreground : 'transparent')};
  flex: 0 0 auto;
  padding-left: ${rem(8)};
`;
