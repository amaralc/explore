import { lazy } from 'react';
import { Route, Routes } from 'react-router-dom';
import { featureFlags } from '../config';

const AuthenticationPage = lazy(() => import('../pages/auth/sign-in'));

export function App() {
  return (
    <Routes>
      {featureFlags.uiProvider === 'shadcn-ui' && <Route path="/auth/sign-in" element={<AuthenticationPage />} />}
    </Routes>
  );
}

export default App;
