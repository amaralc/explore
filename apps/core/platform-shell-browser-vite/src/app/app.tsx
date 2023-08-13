import { lazy } from 'react';
import { Route, Routes } from 'react-router-dom';

const SignInPage = lazy(() => import('../pages/sign-in'));
const RootPage = lazy(() => import('../pages/root'));

export function App() {
  return (
    <Routes>
      <Route path="/sign-in" element={<SignInPage />} />
      <Route path="/" element={<RootPage />} />
    </Routes>
  );
}

export default App;
