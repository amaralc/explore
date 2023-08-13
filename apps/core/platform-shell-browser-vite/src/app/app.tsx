import styled from '@emotion/styled';
import { Button } from '@peerlab/ui/shared/components/ui/button';
import { lazy } from 'react';
import { Link, Route, Routes } from 'react-router-dom';

const StyledApp = styled.div`
  // Your style here
`;

const SignInPage = lazy(() => import('../pages/sign-in'));
const RootPage = lazy(() => import('../pages/root'));

export function App() {
  return (
    <StyledApp>
      <h1>Welcome!</h1>
      <Button>Click Me</Button>

      <Routes>
        <Route path="/sign-in" element={<SignInPage />} />
        <Route path="/" element={<RootPage />} />
      </Routes>
      <br />
      <hr />
      <br />
      <div role="navigation">
        <ul>
          <li>
            <Link to="/">Home</Link>
          </li>
          <li>
            <Link to="/sign-in">SignIn</Link>
          </li>
        </ul>
      </div>
    </StyledApp>
  );
}

export default App;
