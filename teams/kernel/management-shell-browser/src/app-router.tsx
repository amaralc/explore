import { lazy } from 'react';
import { RouteObject, createBrowserRouter } from 'react-router-dom';
import { ErrorBoundary } from '../../shared-ui-components/src/lib/errors/error-boundary';
import { reduxUserSessionRepository } from './domains/people/user-session/adapters/redux-repository';
import { OpenIdConnectAuthCallback } from './domains/people/user-session/components/open-id-connect-auth-callback';
import { PrivateRoute } from './domains/people/user-session/components/private-route';
import { SignInPage } from './domains/people/user-session/pages/sign-in/page';
import { UserProfilePage } from './domains/people/user/pages/profile';
import { UserSettingsPage } from './domains/people/user/pages/settings';
import { HomePage } from './domains/search/pages/home';
import { Layout } from './domains/shared/components/layout';
import { Dashboard } from './domains/shared/pages/dashboard';

const PublicPage = lazy(() => import('./domains/shared/pages/public'));

export const routes: Array<RouteObject> = [
  {
    path: '/',
    element: <Layout />,
    errorElement: <ErrorBoundary fallback={<h1>Router Error Boundary</h1>} />,
    children: [
      {
        index: true,
        element: <HomePage />,
      },
      {
        path: 'public',
        element: <PublicPage />,
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

// Give me a docker command to run a docker container with node 18 image and serve the index.html file under dist/teams/kernel/management-shell-browser folder
