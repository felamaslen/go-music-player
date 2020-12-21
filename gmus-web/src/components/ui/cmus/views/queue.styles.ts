import { rem } from 'polished';
import styled from 'styled-components';

import { ActiveHighlightRow, FlexColumn } from '../styled/layout';

export const Container = styled(FlexColumn)`
  width: 100%;
`;

export const QueueSong = styled(ActiveHighlightRow)`
  width: 100%;
`;

export const Track = styled.span`
  flex: 0 0 ${rem(64)};
`;

export const Title = styled.span`
  flex: 1;
`;

export const Artist = styled.span`
  flex: 1;
`;

export const Album = styled.span`
  flex: 1;
`;
