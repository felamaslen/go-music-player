import { rem } from 'polished';
import styled from 'styled-components';

import { ActiveHighlightRow, FlexList } from '../styled/layout';

export const Container = styled(FlexList)`
  height: 100%;
  width: 100%;
`;

export const QueueSong = styled(ActiveHighlightRow)`
  overflow: hidden;
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
