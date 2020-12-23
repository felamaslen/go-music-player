import { rem } from 'polished';
import styled from 'styled-components';

import { ActiveHighlightRow, FlexList } from '../styled/layout';
import { colors } from '../styled/variables';

export const Container = styled(FlexList)`
  border-left: 1px solid ${colors.border};
  flex: 2 0 0;
  flex-flow: column;
  height: 100%;
`;

export const Song = styled(ActiveHighlightRow)``;

export const QueuePosition = styled.span<{ invert?: boolean }>`
  color: ${({ invert }): string =>
    invert ? colors.active.parentInactive : colors.title.background};
  flex: 0 0 ${rem(16)};
  font-weight: bold;
`;

export const Separator = styled(ActiveHighlightRow)`
  height: ${rem(26)};
  margin-top: ${rem(6)};

  :not(:first-child) {
    border-top: 1px dashed ${colors.selected.inactive};
  }
`;

export const SeparatorText = styled.span`
  box-sizing: border-box;
  color: ${colors.selected.inactive};
  font-style: italic;
  height: ${rem(26)};
  padding: ${rem(4)} 0 ${rem(6)} 0;
  width: 100%;
`;
