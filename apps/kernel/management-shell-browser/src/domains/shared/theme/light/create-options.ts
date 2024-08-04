import type { ThemeOptions } from '@mui/material/styles/createTheme';

import type { ColorPreset, Contrast } from '..';
import { createThemedComponents } from '../base/create-themed-components';
import { createPalette } from './create-palette';
import { createShadows } from './create-shadows';

interface Config {
  colorPreset?: ColorPreset;
  contrast?: Contrast;
}

export const createOptions = ({ colorPreset, contrast }: Config): ThemeOptions => {
  const palette = createPalette({ colorPreset, contrast });
  const components = createThemedComponents({ palette, themeMode: 'light' });
  const shadows = createShadows();

  return {
    components,
    palette,
    shadows,
  };
};
