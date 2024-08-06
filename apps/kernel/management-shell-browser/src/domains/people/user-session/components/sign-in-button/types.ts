import { ReactNode } from 'react';

export interface ISignInButtonProps {
  label: string;
  borderColor: string | null;
  icon: ReactNode;
  disabled: boolean;
  onClick: () => void;
}
