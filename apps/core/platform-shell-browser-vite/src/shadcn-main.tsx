import { getAuth } from 'firebase/auth';
import { StrictMode } from 'react';
import * as ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './app/shadcn-app';
import { firebaseApp } from './libs/firebase';
import './shadcn-index.css';

const auth = getAuth(firebaseApp);
console.log('auth', auth);

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
root.render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
);
