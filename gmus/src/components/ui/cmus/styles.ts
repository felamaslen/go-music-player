import { rem } from 'polished';
import styled from 'styled-components';

import { FlexColumn, FlexRow } from './styled/layout';
import { colors } from './styled/variables';

export const Wrapper = styled(FlexColumn)`
  background: ${colors.background};
  bottom: 0;
  color: ${colors.foreground};
  font-size: ${rem(14)};
  font-family: Hack, monospace;
  left: 0;
  line-height: ${rem(16)};
  position: absolute;
  right: 0;
  top: 0;
  user-select: none;
`;

export const View = styled(FlexRow)`
  flex: 1;
`;
