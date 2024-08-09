import { FC } from 'react';
import { useAuth } from 'react-oidc-context';
import { Navigate } from 'react-router-dom';
import { IOpenIdConnectAuthCallbackProps } from './types';

/**
 * We started using oidc-client-ts but ended up with using react-oidc-context for simplicity.
 * @see https://github.com/authts/react-oidc-context
 * @see https://github.com/authts/oidc-client-ts
 */

export const OpenIdConnectAuthCallback: FC<IOpenIdConnectAuthCallbackProps> = ({ userSessionRepository }) => {
  const auth = useAuth();

  if (auth.isLoading) {
    return <div>Loading...</div>;
  }

  if (auth.isAuthenticated) {
    return <Navigate to="/overview" />;
  }

  return <Navigate to="/auth/sign-in" />;
};
