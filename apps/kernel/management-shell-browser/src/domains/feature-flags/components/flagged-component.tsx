// import { useFlag } from '@unleash/proxy-client-react';
import { FC } from 'react';
import { flagManager } from '../flag-manager';
import { FlaggedComponentProps } from './flagged-component.types';

export const FlaggedComponent: FC<FlaggedComponentProps> = ({ flagName, children, fallback }) => {
  const localFlag = flagManager.getDynamicFlag(flagName);
  const isLocalFlagEnabled = localFlag === true;
  const isFlagEnabled = undefined; // useFlag(flagName);

  if (isLocalFlagEnabled) {
    return children;
  }

  const localFallback = fallback || null;
  return isFlagEnabled ? children : localFallback;
};
