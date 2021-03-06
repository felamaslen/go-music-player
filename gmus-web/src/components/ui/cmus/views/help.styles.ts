import { rem } from 'polished';
import styled from 'styled-components';

import { FlexColumn } from '../styled/layout';
import { H5 } from '../styled/typography';
import { colors } from '../styled/variables';

export const HelpDialogContainer = styled(FlexColumn)`
  background: ${colors.background};
  border: 1px solid ${colors.active.color};
  padding: ${rem(8)} ${rem(16)};
`;

export const Commands = styled(FlexColumn)`
  flex: 1;
  margin-right: ${rem(24)};
`;

export const Descriptions = styled(FlexColumn)`
  flex: 2;
  text-align: left;
  white-space: nowrap;
`;

export const CommandGroup = styled(FlexColumn)`
  margin-bottom: ${rem(8)};
`;

export const CommandGroupTitle = styled(H5)`
  color: ${colors.selected.inactive};
  font-style: italic;
`;
