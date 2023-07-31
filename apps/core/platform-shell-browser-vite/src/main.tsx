import { FlagProvider } from '@unleash/proxy-client-react';
import { StrictMode } from 'react';
import * as ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './app/app';

const config = {
  url: import.meta.env['VITE_UNLEASH_URL'] as string, // '<unleash-url>/api/frontend', // Your front-end API URL or the Unleash proxy's URL (https://<proxy-url>/proxy)
  clientKey: import.meta.env['VITE_UNLEASH_CLIENT_KEY'] as string, //'<your-token>', // A client-side API token OR one of your proxy's designated client keys (previously known as proxy secrets)
  refreshInterval: 15, // How often (in seconds) the client should poll the proxy for updates
  appName: import.meta.env['VITE_UNLEASH_APP_NAME'] as string, // 'your-app-name', // The name of your application. It's only used for identifying your application
};

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
root.render(
  <StrictMode>
    <FlagProvider config={config}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </FlagProvider>
  </StrictMode>
);
