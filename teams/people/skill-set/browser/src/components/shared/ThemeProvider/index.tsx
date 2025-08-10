import { MantineProvider, createTheme } from '@mantine/core';
import '@mantine/core/styles.css';
import * as React from 'react';

export interface ThemeProviderProps {
  children: React.ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps): React.JSX.Element {
  const theme = createTheme({});

  return <MantineProvider theme={theme}>{children}</MantineProvider>;
}
