import { ZitadelConfig, createZitadelAuth } from '@zitadel/react';
import { useEffect, useState } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';

import { zitadelConfig } from '../../../../../config';
import { OpenIdConnectCallback } from '../open-id-connect-callback';
import Login from './components/login';

function App() {
  const config: ZitadelConfig = {
    authority: zitadelConfig.authority, // ,'http://localhost:8080',
    client_id: zitadelConfig.clientId,
    redirect_uri: zitadelConfig.redirectUri, //'http://localhost:4200/auth/callback',
  };

  const zitadel = createZitadelAuth(config);

  function login() {
    zitadel.authorize();
  }

  function signout() {
    zitadel.signout();
  }

  const [authenticated, setAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    zitadel.userManager.getUser().then((user) => {
      if (user) {
        setAuthenticated(true);
      } else {
        setAuthenticated(false);
      }
    });
  }, [zitadel]);

  return (
    <div className="App">
      <header className="App-header">
        <p>Welcome to ZITADEL React</p>

        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Login authenticated={authenticated} handleLogin={login} />} />
            <Route
              path="/callback"
              element={
                <OpenIdConnectCallback
                  isAuthenticated={authenticated}
                  setAuth={setAuthenticated}
                  handleLogout={signout}
                  userManager={zitadel.userManager}
                />
              }
            />
          </Routes>
        </BrowserRouter>
      </header>
    </div>
  );
}

export default App;
