import { createRoot } from 'react-dom/client';
import { AppProviders } from './app-providers';
import { AppRouter } from './app-router';

const rootContainer = document.getElementById('root');

if (!rootContainer) {
  throw Error('No root element found');
}

const root = createRoot(rootContainer);

root.render(
  <AppProviders>
    <AppRouter />
  </AppProviders>,
);
