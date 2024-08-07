import { FC, ReactNode } from 'react';
import { Outlet } from 'react-router-dom';
import { LayoutFooter } from './layout-footer';
import { LayoutHeader } from './layout-header';
import { LayoutRoot } from './layout-root';
import { LayoutSideBar } from './layout-sidebar';

export const Layout: FC<{ children: ReactNode }> = ({ children }) => {
  return (
    <LayoutRoot>
      <LayoutHeader />
      <LayoutSideBar />
      {children}
      <LayoutFooter />
      <Outlet />
    </LayoutRoot>
  );
};
