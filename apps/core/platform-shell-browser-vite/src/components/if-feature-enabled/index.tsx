import { useFlag } from '@unleash/proxy-client-react';
import { FC } from 'react';
import { IIfFeatureEnabledProps } from './types';

export const IfFeatureEnabled: FC<IIfFeatureEnabledProps> = ({ featureKey, children }) => {
  const isFlagEnabled = useFlag(featureKey);
  console.log('featureKey', isFlagEnabled);
  return isFlagEnabled ? children : null;
};
