import React from 'react';
import { useAuth } from 'react-oidc-context';
import { Navigate } from 'react-router-dom';
import { IPrivateRouteWrapperProps } from './types';

export const PrivateRoute: React.FC<IPrivateRouteWrapperProps> = ({ element, userSessionRepository }) => {
  const auth = useAuth();

  if (auth.isLoading) {
    return <div>Loading...</div>;
  }

  if (!auth.isAuthenticated) {
    return <Navigate to="/auth/sign-in" />;
  }

  return element;
};
