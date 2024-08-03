import { CssBaseline } from '@mui/material';
import { ThemeProvider } from '@mui/material/styles';
import React from 'react';
import { Helmet } from 'react-helmet-async';
import { createTheme } from '../../../theme';
import { ICustomThemeProviderProps } from './custom-theme-provider.types';
import { TextDirectionRightToLeft } from './text-direction-right-to-left';

export const CustomThemeProvider: React.FC<ICustomThemeProviderProps> = ({ children, themeSettingsRepository }) => {
  const settings = themeSettingsRepository.useThemeSettings();
  const theme = createTheme({
    colorPreset: settings.colorPreset,
    contrast: settings.contrast,
    direction: settings.direction,
    paletteMode: settings.paletteMode,
    responsiveFontSizes: settings.responsiveFontSizes,
  });

  return (
    <ThemeProvider theme={theme}>
      <Helmet>
        <meta name="color-scheme" content={settings.paletteMode} />
        <meta name="theme-color" content={theme.palette.neutral[900]} />
      </Helmet>
      <TextDirectionRightToLeft direction={settings.direction}>
        <CssBaseline />
        {children}
      </TextDirectionRightToLeft>
    </ThemeProvider>
  );
};
