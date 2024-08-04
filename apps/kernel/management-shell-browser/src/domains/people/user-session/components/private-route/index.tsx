import React from 'react';
import { Navigate } from 'react-router-dom';
import { IPrivateRouteWrapperProps } from './types';

export const PrivateRoute: React.FC<IPrivateRouteWrapperProps> = ({ element, userSessionRepository }) => {
  const session = userSessionRepository.useSession();
  return session.isAuthenticated ? element : <Navigate to="/auth/sign-in" />;
};
