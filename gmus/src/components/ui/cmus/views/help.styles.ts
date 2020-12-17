import { rem } from 'polished';
import styled from 'styled-components';

import { FlexColumn } from '../styled/layout';
import { colors } from '../styled/variables';

export const HelpDialogContainer = styled(FlexColumn)`
  background: ${colors.background};
  border: 1px solid ${colors.active.color};
  padding: ${rem(8)} ${rem(16)};

  h3 {
    font-weight: bold;
  }
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

export const CommandGroupTitle = styled.h5`
  color: ${colors.selected.inactive};
  font-style: italic;
  margin: ${rem(8)} 0;
`;
