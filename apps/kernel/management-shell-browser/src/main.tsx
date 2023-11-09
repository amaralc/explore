import { App } from '@peerlab/kernel/management-shell-browser/app';
import { FlagProvider } from '@unleash/proxy-client-react';
import { Suspense } from 'react';
import { createRoot } from 'react-dom/client';
import { HelmetProvider } from 'react-helmet-async';
import { BrowserRouter } from 'react-router-dom';
import { ErrorBoundary } from './components/error-boundary';
import { unleashConfig } from './config';

const root = createRoot(document.getElementById('root') as HTMLElement);

root.render(
  <HelmetProvider>
    <BrowserRouter>
      <Suspense>
        <ErrorBoundary fallback={<App />}>
          <FlagProvider config={unleashConfig}>
            <App />
          </FlagProvider>
        </ErrorBoundary>
      </Suspense>
    </BrowserRouter>
  </HelmetProvider>,
);
