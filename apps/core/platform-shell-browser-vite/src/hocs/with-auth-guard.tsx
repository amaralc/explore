import type { FC } from 'react';
import { AuthGuard } from '../components/guards/auth-guard';

export const withAuthGuard = <P extends object>(Component: FC<P>): FC<P> => {
  return function WithAuthGuard(props: P) {
    return (
      <AuthGuard>
        <Component {...props} />
      </AuthGuard>
    );
  };
};
