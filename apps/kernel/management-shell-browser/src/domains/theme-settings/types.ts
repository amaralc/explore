import type { ColorPreset, Contrast, Direction, PaletteMode } from '../../theme';

type Layout = 'horizontal' | 'vertical';

type NavColor = 'blend-in' | 'discrete' | 'evident';

export interface IThemeSettings {
  colorPreset: ColorPreset;
  contrast: Contrast;
  direction: Direction;
  paletteMode: PaletteMode;
  responsiveFontSizes: boolean;
  layout: Layout;
  navColor: NavColor;
  stretch: boolean;
}
