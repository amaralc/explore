import styled from '@emotion/styled';

import NxWelcome from './nx-welcome';

import { Link, Route, Routes } from 'react-router-dom';
import { AuthGuard } from '../components/auth-guard';

const StyledApp = styled.div`
  // Your style here
`;

export function App() {
  return (
    <StyledApp>
      <NxWelcome title="core-platform-shell-browser-vite" />
      <Routes>
        <Route
          path="/sign-in"
          element={
            <div>
              <Link to="/">Click here to go back to root page.</Link>
            </div>
          }
        />

        <Route
          path="/"
          element={
            <AuthGuard>
              <div>
                This is the generated root route. <Link to="/page-2">Click here for page 2.</Link>
              </div>
            </AuthGuard>
          }
        />
      </Routes>
      {/* END: routes */}
      {/* START: routes */}
      {/* These routes and navigation have been generated for you */}
      {/* Feel free to move and update them to fit your needs */}
      <br />
      <hr />
      <br />
      <div role="navigation">
        <ul>
          <li>
            <Link to="/">Home</Link>
          </li>
          <li>
            <Link to="/page-2">Page 2</Link>
          </li>
        </ul>
      </div>
    </StyledApp>
  );
}

export default App;
