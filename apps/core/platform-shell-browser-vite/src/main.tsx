import { getAuth } from 'firebase/auth';
import React, { StrictMode } from 'react';
import * as ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './app/app';
import { unleashConfig } from './config';
import './index.css';
import { firebaseApp } from './libs/firebase';

// Lazy load the FlagProvider component
const FlagProviderLazy = React.lazy(() =>
  import('@unleash/proxy-client-react').then((module) => ({ default: module.FlagProvider })),
);

const auth = getAuth(firebaseApp);
console.log('auth', auth);

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
root.render(
  <StrictMode>
    <FlagProviderLazy config={unleashConfig}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </FlagProviderLazy>
  </StrictMode>,
);
