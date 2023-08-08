// import { useFlag } from '@unleash/proxy-client-react';
import { FC } from 'react';
import { featureFlags } from '../../config';
import { IIfFeatureEnabledProps } from './types';

export const IfFeatureEnabled: FC<IIfFeatureEnabledProps> = ({ featureKey, children, fallback }) => {
  const isFlagEnabled = featureFlags[featureKey];
  // const unleashIsFlagEnabled = useFlag(featureKey);
  return isFlagEnabled ? children : fallback;
};
