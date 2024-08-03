import { createRoot } from 'react-dom/client';
import { App } from './app';

const rootContainer = document.getElementById('root');

if (!rootContainer) {
  throw Error('No root element found');
}

const root = createRoot(rootContainer);

root.render(<App />);
