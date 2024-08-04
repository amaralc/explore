import { User } from 'oidc-client-ts';
import { FC, useEffect, useState } from 'react';
import { IOpenIdConnectCallbackProps } from './types';

export const OpenIdConnectCallback: FC<IOpenIdConnectCallbackProps> = ({
  isAuthenticated,
  setAuth,
  userManager,
  handleLogout,
}) => {
  const [userInfo, setUserInfo] = useState<User | null>(null);

  useEffect(() => {
    if (isAuthenticated === null) {
      userManager
        .signinRedirectCallback()
        .then((user: User) => {
          if (user) {
            setAuth(true);
            setUserInfo(user);
          } else {
            setAuth(false);
          }
        })
        .catch((error: any) => {
          setAuth(false);
        });
    }
    if (isAuthenticated === true && userInfo === null) {
      userManager
        .getUser()
        .then((user) => {
          if (user) {
            setAuth(true);
            setUserInfo(user);
          } else {
            setAuth(false);
          }
        })
        .catch((error: any) => {
          setAuth(false);
        });
    }
  }, [isAuthenticated, userManager, setAuth]);
  if (isAuthenticated === true && userInfo) {
    return (
      <div className="user">
        <h2>Welcome, {userInfo.profile.name}!</h2>
        <p className="description">Your ZITADEL Profile Information</p>
        <p>Name: {userInfo.profile.name}</p>
        <p>Email: {userInfo.profile.email}</p>
        <p>Email Verified: {userInfo.profile.email_verified ? 'Yes' : 'No'}</p>
        <p>Roles: {JSON.stringify(userInfo.profile['urn:zitadel:iam:org:project:roles'])}</p>

        <button onClick={handleLogout}>Log out</button>
      </div>
    );
  } else {
    return <div>Loading...</div>;
  }
};
