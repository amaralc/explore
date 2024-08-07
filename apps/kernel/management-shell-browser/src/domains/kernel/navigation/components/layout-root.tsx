import { FC, ReactNode } from 'react';
import { LayoutFooter } from './layout-footer';
import { LayoutHeader } from './layout-header';
import { LayoutSideBar } from './layout-sidebar';

interface ILayoutRootProps {
  children: ReactNode;
}

export const LayoutRoot: FC<ILayoutRootProps> = ({ children }) => {
  return <>{children}</>;
};

export const Layout = {
  Root: LayoutRoot,
  Header: LayoutHeader,
  Footer: LayoutFooter,
  SideBar: LayoutSideBar,
};
