import { FC } from 'react';
import { ErrorBoundary } from '../error-boundary';
import { FlaggedComponent } from './flagged-component';

interface IfFlagEnabledProps {
  flagName: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export const IfFlagEnabled: FC<IfFlagEnabledProps> = ({ flagName, children, fallback }) => {
  const localFallback = fallback || null;
  return (
    <ErrorBoundary fallback={localFallback}>
      <FlaggedComponent flagName={flagName} fallback={localFallback}>
        {children}
      </FlaggedComponent>
    </ErrorBoundary>
  );
};
