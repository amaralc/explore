import { StrictMode } from 'react';
import * as ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';

import App from './app/app';
import { ErrorBoundary } from './components/shared/ErrorBoundary/idex';

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
root.render(
  <StrictMode>
    <BrowserRouter>
      <ErrorBoundary fallback={null}>
        <App />
      </ErrorBoundary>
    </BrowserRouter>
  </StrictMode>,
);
