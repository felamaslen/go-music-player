import { rem } from 'polished';
import { CSSProperties } from 'react';
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

export const ViewTitle = styled(FlexRow)`
  background: ${colors.title.background};
  color: ${colors.background};
  font-weight: bold;
`;

export const ViewTitleItem = styled.span<{ active: boolean }>`
  font-weight: ${({ active }): CSSProperties['fontWeight'] => (active ? 'bold' : 'normal')};
  margin: 0 ${rem(16)} 0 ${rem(8)};
`;

export const View = styled(FlexRow)`
  flex: 1;
  overflow: hidden;
  width: 100%;
  z-index: 10;
`;

export const Overlay = styled.div`
  left: 50%;
  position: absolute;
  top: 50%;
  transform: translateX(-50%) translateY(-50%);
  z-index: 20;
`;
