import { Container } from '@mui/material';
import { FC, ReactNode } from 'react';

export const LayoutContent: FC<{ children: ReactNode }> = ({ children }) => {
  return <Container maxWidth="xl">{children}</Container>;
};
