import { rem } from 'polished';
import styled from 'styled-components';

import { ActiveHighlightRow, FlexList } from '../styled/layout';

export const Container = styled(FlexList)`
  flex: 1 0 0;
`;

export const ArtistTitle = styled(ActiveHighlightRow)``;

export const AlbumTitle = styled(ActiveHighlightRow)`
  span {
    padding-left: ${rem(32)};
  }
`;
