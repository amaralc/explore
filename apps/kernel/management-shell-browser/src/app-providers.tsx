import { Suspense, type FC } from 'react';
import { HelmetProvider } from 'react-helmet-async';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { ErrorBoundary } from './components/error-boundary';
import './global.css';
import { store } from './store';

export const AppProviders: FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <HelmetProvider>
      <BrowserRouter>
        <Suspense>
          <ErrorBoundary fallback={null}>
            <Provider store={store}>{children}</Provider>
          </ErrorBoundary>
        </Suspense>
      </BrowserRouter>
    </HelmetProvider>
  );
};
