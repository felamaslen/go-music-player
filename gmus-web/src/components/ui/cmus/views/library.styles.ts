import { CSSProperties } from 'react';
import styled from 'styled-components';
import { FlexRow } from '../styled/layout';

export type ContainerProps = { hidden: boolean };

export const Container = styled(FlexRow)<ContainerProps>`
  display: ${({ hidden }): CSSProperties['display'] => (hidden ? 'none' : 'flex')};
  flex: 1;
  height: 100%;
`;
