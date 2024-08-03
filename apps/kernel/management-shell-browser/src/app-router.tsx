import { RouteObject, createBrowserRouter } from 'react-router-dom';
import { SearchPage } from './domains/public/pages/search';
import { Layout } from './domains/shared/components/layout';
import { Dashboard } from './domains/shared/pages/dashboard';
import { UserProfilePage } from './domains/user/pages/profile';
import { UserSettingsPage } from './domains/user/pages/settings';
import { SignInPage } from './domains/user/pages/sign-in';

export const routes: Array<RouteObject> = [
  {
    path: '/',
    element: <Layout />,
    children: [
      {
        index: true,
        element: <SearchPage />,
      },
      {
        path: 'sign-in',
        element: <SignInPage />,
      },
      {
        path: 'workspaces',
        element: <Dashboard />,
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
