import { RouteObject, createBrowserRouter } from 'react-router-dom';
import { ErrorBoundary } from '../../shared-ui-components/src/lib/errors/error-boundary';
import { Layout } from './domains/kernel/navigation/components/layout';
import { reduxUserSessionRepository } from './domains/people/user-session/adapters/redux-repository';
import { OpenIdConnectAuthCallback } from './domains/people/user-session/components/open-id-connect-auth-callback';
import { PrivateRoute } from './domains/people/user-session/components/private-route';
import { SignInPage } from './domains/people/user-session/pages/sign-in/page';
import { UserProfilePage } from './domains/people/user/pages/profile';
import { UserSettingsPage } from './domains/people/user/pages/settings';
import { HomePage } from './domains/search/pages/home';
import { Dashboard } from './domains/shared/pages/dashboard';

export const routes: Array<RouteObject> = [
  {
    path: '/',
    element: <Layout />,
    errorElement: <ErrorBoundary fallback={null} />,
    children: [
      {
        index: true,
        element: <HomePage />,
      },
      {
        path: 'auth/sign-in',
        element: <SignInPage />,
      },
      {
        path: 'auth/callback/zitadel',
        element: <OpenIdConnectAuthCallback userSessionRepository={reduxUserSessionRepository} />,
      },
      {
        path: 'workspaces',
        element: <PrivateRoute element={<Dashboard />} userSessionRepository={reduxUserSessionRepository} />,
        children: [
          { path: 'profile', element: <UserProfilePage /> },
          { path: 'settings', element: <UserSettingsPage /> },
        ],
      },
    ],
  },
];

export const browserRouter = createBrowserRouter(routes);
export type IRouter = typeof browserRouter;

if (import.meta.hot) {
  import.meta.hot.dispose(() => browserRouter.dispose());
}
