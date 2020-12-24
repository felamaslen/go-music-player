import { rem } from 'polished';
import styled from 'styled-components';
import { systemColors } from '../../../constants/theme';

export const Container = styled.div`
  align-items: center;
  background: ${systemColors.background};
  bottom: 0;
  display: flex;
  flex-flow: column;
  font: ${rem(16)} sans-serif;
  position: absolute;
  right: 0;
  top: 0;
  width: 100%;
`;
