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
