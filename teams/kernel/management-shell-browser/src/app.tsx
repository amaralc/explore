import { type FC } from 'react';
import { RouterProvider } from 'react-router-dom';
import { AppProviders } from './app-providers';
import { IRouter } from './app-router';
import './global.css';

export const App: FC<{ router: IRouter }> = ({ router }) => {
  return (
    <AppProviders>
      <RouterProvider router={router} />
    </AppProviders>
  );
};
