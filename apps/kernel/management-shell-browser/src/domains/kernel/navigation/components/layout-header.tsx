import { Stack } from '@mui/material';
import AppBar from '@mui/material/AppBar';
import Container from '@mui/material/Container';
import { FC, ReactNode } from 'react';

export const LayoutHeader: FC<{ children?: ReactNode }> = ({ children }) => {
  return (
    <AppBar position="static">
      <Container maxWidth="xl">
        <Stack direction={'column'}>{children}</Stack>
      </Container>
    </AppBar>
  );
};
