import { FC, ReactNode } from 'react';

interface ILayoutRootProps {
  children: ReactNode;
}

export const LayoutRoot: FC<ILayoutRootProps> = ({ children }) => {
  return <>{children}</>;
};
