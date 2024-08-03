import { FC } from 'react';
import { ErrorBoundary } from '../../errors/components/error-boundary';
import { FlaggedComponent } from './flagged-component';
import { IfFlagEnabledProps } from './if-flag-enabled.types';

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
