import { rem } from 'polished';
import styled from 'styled-components';

import { FlexColumn, FlexRow } from '../styled/layout';
import { colors } from '../styled/variables';

export const StatusContainer = styled(FlexColumn)`
  flex: 0 0 ${rem(32)};
  width: 100%;
`;

export const TrackMetadata = styled(FlexRow)`
  background: ${colors.selected.background};
  color: ${colors.foreground};
  flex: 1;
  white-space: nowrap;
  width: 100%;
`;

export const PlayStatus = styled(FlexRow)`
  background: ${colors.selected.inactive};
  color: ${colors.background};
  flex: 1;
  justify-content: space-between;
  width: 100%;
`;

export const Time = styled.div`
  flex: 1;
`;

export const ClientName = styled.span``;
