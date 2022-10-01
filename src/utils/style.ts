import {
  blue,
  blueDark,
  gray,
  grayDark,
  green,
  greenDark,
  red,
  redDark,
} from "@radix-ui/colors";

import { createStitches } from "@stitches/core";

const { createTheme, css } = createStitches({
  theme: {
    colors: {
      ...gray,
      ...blue,
      ...red,
      ...green,
    },
  },
});

export { css };

export const darkTheme = createTheme({
  colors: {
    ...grayDark,
    ...blueDark,
    ...redDark,
    ...greenDark,
  },
});
