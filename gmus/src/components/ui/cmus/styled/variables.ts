import { rgb } from 'polished';

export const colors = {
  background: rgb(0, 0, 0),
  border: rgb(0, 0, 180),
  foreground: rgb(255, 255, 255),
  selected: {
    background: rgb(0, 0, 180),
    inactive: rgb(210, 210, 210),
  },
  active: {
    color: rgb(255, 255, 130),
    parentInactive: rgb(102, 0, 165),
  },
};
