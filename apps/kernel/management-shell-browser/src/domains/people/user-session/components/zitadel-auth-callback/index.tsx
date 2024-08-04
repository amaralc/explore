import { User } from 'oidc-client-ts';
import { FC, useEffect } from 'react';
import { zitadel } from '../../utils/zitadel';
import { IZitadelAuthCallbackProps } from './types';

/**
 * @see https://github.com/authts/react-oidc-context
 */

export const ZitadelAuthCallback: FC<IZitadelAuthCallbackProps> = ({ userSessionRepository }) => {
  const userSession = userSessionRepository.useSession();
  const { isAuthenticated, user } = userSession;

  console.log(user);

  useEffect(() => {
    if (isAuthenticated === null) {
      zitadel.userManager
        .signinRedirectCallback()
        .then((authenticatedUser: User) => {
          console.log(authenticatedUser);
          if (authenticatedUser) {
            userSessionRepository.useSetUserSession({
              avatarUrl: authenticatedUser.profile.picture || '',
              email: authenticatedUser.profile.email || '',
              id: authenticatedUser.profile.sub,
              name: authenticatedUser.profile.name || '',
            });
          } else {
            userSessionRepository.useSetUserSession(null);
          }
        })
        .catch((error: any) => {
          userSessionRepository.useSetUserSession(null);
        });
    }
    if (isAuthenticated === true && user === null) {
      zitadel.userManager
        .getUser()
        .then((authenticatedUser) => {
          if (authenticatedUser) {
            userSessionRepository.useSetUserSession({
              avatarUrl: authenticatedUser.profile.picture || '',
              email: authenticatedUser.profile.email || '',
              id: authenticatedUser.profile.sub,
              name: authenticatedUser.profile.name || '',
            });
          } else {
            userSessionRepository.useSetUserSession(null);
          }
        })
        .catch((error: any) => {
          userSessionRepository.useSetUserSession(null);
        });
    }
  }, [isAuthenticated, user, userSessionRepository]);

  return <div>ZitadelAuthCallback</div>;
};
