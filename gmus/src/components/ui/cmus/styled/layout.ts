import { CSSProperties } from 'react';
import styled from 'styled-components';

import { colors } from './variables';

export const FlexRow = styled.div`
  display: flex;
`;

export const FlexColumn = styled(FlexRow)`
  flex-flow: column;
`;

export const ActiveHighlightRow = styled(FlexRow)<{
  active?: boolean;
  highlight?: boolean;
  parentActive?: boolean;
}>`
  background: ${({ active, parentActive }): string => {
    if (active) {
      if (parentActive) {
        return colors.selected.background;
      }
      return colors.selected.inactive;
    }
    return 'none';
  }};

  color: ${({ active, highlight, parentActive }): string => {
    if (highlight) {
      return colors.active.color;
    }
    if (active && !parentActive) {
      return colors.background;
    }
    return colors.foreground;
  }};

  font-weight: ${({ active, highlight }): CSSProperties['fontWeight'] =>
    active || highlight ? 'bold' : 'normal'};

  width: 100%;
`;
