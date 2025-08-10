import { ReactNode } from 'react';

type IDirection = 'ltr' | 'rtl';

export interface ITextDirectionRightToLeftProps {
  children: ReactNode;
  direction?: IDirection;
}
