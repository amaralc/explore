import { Container } from '@mantine/core';
import * as React from 'react';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout = ({ children }: LayoutProps): React.JSX.Element => {
  return (
    <Container style={{ width: '80%', maxWidth: 1200 }}>
      <main>{children}</main>
    </Container>
  );
};
