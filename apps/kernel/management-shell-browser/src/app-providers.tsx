import { ReactNode, Suspense, type FC } from 'react';
import { HelmetProvider } from 'react-helmet-async';
import { Provider } from 'react-redux';
import { ErrorBoundary } from './domains/errors/components/error-boundary';
import { reduxThemeSettingsRepository } from './domains/theme-settings/adapters/redux-repository';
import { CustomThemeProvider } from './domains/theme-settings/components/custom-theme-provider';
import './global.css';
import { store } from './redux-store';

export const AppProviders: FC<{ children: ReactNode }> = ({ children }) => {
  return (
    <Provider store={store}>
      <Suspense>
        <ErrorBoundary fallback={null}>
          <HelmetProvider>
            <CustomThemeProvider themeSettingsRepository={reduxThemeSettingsRepository}>{children}</CustomThemeProvider>
          </HelmetProvider>
        </ErrorBoundary>
      </Suspense>
    </Provider>
  );
};
