import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './app';
import { browserRouter } from './app-router';

const rootContainer = document.getElementById('root');

if (!rootContainer) {
  throw Error('No root element found');
}

const root = createRoot(rootContainer);

root.render(
  <StrictMode>
    <App router={browserRouter} />
  </StrictMode>,
);
