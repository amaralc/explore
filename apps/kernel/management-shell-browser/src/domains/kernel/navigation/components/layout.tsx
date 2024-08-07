import { FC } from 'react';
import { ContextBar } from '../../../people/user-session/components/context/context-bar';
import { ContextNavigation } from '../../../people/user-session/components/context/context-navigation';
import { LayoutFooter } from './layout-footer';
import { LayoutHeader } from './layout-header';
import { LayoutRoot } from './layout-root';
import { LayoutSideBar } from './layout-sidebar';

const Layout = {
  Root: LayoutRoot,
  Header: LayoutHeader,
  Footer: LayoutFooter,
  SideBar: LayoutSideBar,
};

export const AppLayout: FC = () => {
  return (
    <Layout.Root>
      <Layout.Header>
        <ContextBar />
        <ContextNavigation />
      </Layout.Header>
      <Layout.SideBar />
      <Layout.Footer />
    </Layout.Root>
  );
};
