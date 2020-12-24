import { rem } from 'polished';
import React from 'react';
import styled from 'styled-components';

import logo1x from '../images/logo1x.png';
import logo2x from '../images/logo2x.png';

export type Props = {
  size?: number;
};

const Picture = styled.picture<Required<Props>>`
  img {
    height: ${({ size }): string => rem(size)};
    width: ${({ size }): string => rem(size)};
  }
`;

export const Logo: React.FC<Props> = ({ size = 256 }) => (
  <Picture size={size}>
    <img srcSet={`${logo2x} 2x, ${logo1x} 1x`} alt="logo" />
  </Picture>
);
