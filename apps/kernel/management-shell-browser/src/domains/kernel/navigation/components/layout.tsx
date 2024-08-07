import { FC } from 'react';
import { Outlet } from 'react-router-dom';
import { ContextBar } from '../../../people/user-session/components/context/context-bar';
import { ContextNavigation } from '../../../people/user-session/components/context/context-navigation';
import { LayoutContent } from './layout-content';
import { LayoutFooter } from './layout-footer';
import { LayoutHeader } from './layout-header';
import { LayoutRoot } from './layout-root';
import { LayoutSideBar } from './layout-sidebar';

const Layout = {
  Root: LayoutRoot,
  Header: LayoutHeader,
  Footer: LayoutFooter,
  SideBar: LayoutSideBar,
  Content: LayoutContent,
};

export const AppLayout: FC = () => {
  return (
    <Layout.Root>
      <Layout.Header>
        <ContextBar />
        <ContextNavigation />
      </Layout.Header>
      <Layout.SideBar />
      <Layout.Content>
        {/* Render nested route */}
        <Outlet />
      </Layout.Content>
      <Layout.Footer />
    </Layout.Root>
  );
};
