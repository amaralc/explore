import { FC, useCallback, useEffect, useState } from 'react';
import { useRouter } from '../../hooks/use-router';
import { AuthGuardProps } from './types';

const useAuth = () => {
  return {
    isAuthenticated: false,
  };
};

export const AuthGuard: FC<AuthGuardProps> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [checked, setChecked] = useState<boolean>(false);
  const router = useRouter();

  const check = useCallback(() => {
    if (!isAuthenticated) {
      router.replace('/sign-in');
    } else {
      setChecked(true);
    }
  }, [isAuthenticated, router]);

  // Only check on mount, this allows us to redirect the user manually when auth state changes
  useEffect(
    () => check(),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  if (!checked) {
    return null;
  }

  // Redirect did not occur, which means the user is authenticated / authorized.
  return children;
};
