import { rem } from 'polished';
import { CSSProperties } from 'react';
import styled from 'styled-components';
import { ActiveHighlightRow, ActiveHighlightRowProps, FlexColumn } from '../styled/layout';
import { colors } from '../styled/variables';

export const Container = styled.div`
  background: ${colors.background};
  border: 1px solid ${colors.border};
  overflow-y: hidden;
  padding: ${rem(8)} ${rem(16)} ${rem(16)} ${rem(16)};
  z-index: 11;
`;

export const List = styled(FlexColumn)`
  min-width: ${rem(360)};
  overflow-y: auto;
`;

export const Client = styled(ActiveHighlightRow)<ActiveHighlightRowProps>`
  display: flex;
  font-weight: ${({ highlight }): CSSProperties['fontWeight'] => (highlight ? 'bold' : 'normal')};
  justify-content: space-between;
  width: 100%;
`;

export const ClientName = styled.span`
  flex: 1;
  margin-right: ${rem(64)};
`;
