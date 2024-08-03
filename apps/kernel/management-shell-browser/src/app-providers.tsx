import { Suspense, type FC } from 'react';
import { HelmetProvider } from 'react-helmet-async';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { ErrorBoundary } from './domains/errors/components/error-boundary';
import { reduxThemeSettingsRepository } from './domains/theme-settings/adapters/redux-repository';
import { CustomThemeProvider } from './domains/theme-settings/components/custom-theme-provider';
import './global.css';
import { store } from './redux-store';

export const AppProviders: FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <HelmetProvider>
      <BrowserRouter>
        <Suspense>
          <ErrorBoundary fallback={null}>
            <Provider store={store}>
              <CustomThemeProvider themeSettingsRepository={reduxThemeSettingsRepository}>
                {children}
              </CustomThemeProvider>
            </Provider>
          </ErrorBoundary>
        </Suspense>
      </BrowserRouter>
    </HelmetProvider>
  );
};
