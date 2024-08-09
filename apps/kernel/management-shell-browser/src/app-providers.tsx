import { ReactNode, Suspense, type FC } from 'react';
import { HelmetProvider } from 'react-helmet-async';
import { AuthProvider } from 'react-oidc-context';
import { Provider } from 'react-redux';
import { ErrorBoundary } from '../../shared-ui-components/src/lib/errors/error-boundary';
import { reduxThemeSettingsRepository } from './domains/kernel/theme-settings/adapters/redux-repository';
import { CustomThemeProvider } from './domains/kernel/theme-settings/components/custom-theme-provider';
import { zitadel } from './domains/people/user-session/utils/zitadel';
import './global.css';
import { store } from './redux-store';

export const AppProviders: FC<{ children: ReactNode }> = ({ children }) => {
  return (
    <Provider store={store}>
      <AuthProvider
        userManager={zitadel.userManager}
        onSigninCallback={(_user): void => {
          window.history.replaceState({}, document.title, window.location.pathname);
        }}
      >
        <Suspense>
          <ErrorBoundary fallback={<h1>Error Boundary</h1>}>
            <HelmetProvider>
              <CustomThemeProvider themeSettingsRepository={reduxThemeSettingsRepository}>
                {children}
              </CustomThemeProvider>
            </HelmetProvider>
          </ErrorBoundary>
        </Suspense>
      </AuthProvider>
    </Provider>
  );
};
