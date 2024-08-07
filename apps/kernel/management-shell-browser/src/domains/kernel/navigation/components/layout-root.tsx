import { FC, ReactNode } from 'react';
import { Outlet } from 'react-router-dom';

interface ILayoutRootProps {
  children: ReactNode;
}

export const LayoutRoot: FC<ILayoutRootProps> = ({ children }) => {
  return (
    <>
      {children}
      <Outlet />
    </>
  );
};
