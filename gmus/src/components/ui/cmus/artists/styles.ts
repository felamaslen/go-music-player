import { rem } from 'polished';
import styled from 'styled-components';

import { ActiveHighlightRow, FlexColumn } from '../styled/layout';

export const Container = styled(FlexColumn)`
  flex: 1;
`;

export const ArtistRow = styled(FlexColumn)``;

export const ArtistTitle = styled(ActiveHighlightRow)``;

export const ArtistAlbums = styled.ul`
  list-style: none;
  margin: 0;
  padding: 0 0 0 ${rem(16)};
`;

export const AlbumTitle = styled(ActiveHighlightRow)``;
