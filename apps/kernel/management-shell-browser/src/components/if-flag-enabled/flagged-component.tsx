import { useFlag } from '@unleash/proxy-client-react';
import { FC } from 'react';

interface FlaggedComponentProps {
  flagName: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export const FlaggedComponent: FC<FlaggedComponentProps> = ({ flagName, children, fallback }) => {
  const isFlagEnabled = useFlag(flagName);
  const localFallback = fallback || null;
  return isFlagEnabled ? children : localFallback;
};
