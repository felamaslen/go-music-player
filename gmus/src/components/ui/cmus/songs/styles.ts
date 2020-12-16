import styled from 'styled-components';

import { ActiveHighlightRow, FlexRow } from '../styled/layout';
import { colors } from '../styled/variables';

export const Container = styled(FlexRow)`
  border-left: 1px solid ${colors.border};
  flex: 2;
  flex-flow: column;
  height: 100%;
`;

export const Song = styled(ActiveHighlightRow)``;
