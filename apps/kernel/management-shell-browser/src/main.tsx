import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
// import { App } from './app';
// import { browserRouter } from './app-router';
import App from './domains/people/user-session/components/zitadel-example/zitadel-example';

const rootContainer = document.getElementById('root');

if (!rootContainer) {
  throw Error('No root element found');
}

const root = createRoot(rootContainer);

root.render(
  <StrictMode>
    <App />
  </StrictMode>,
);
