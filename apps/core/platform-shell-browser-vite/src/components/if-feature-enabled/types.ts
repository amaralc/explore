import { featureFlags } from '../../config';

export interface IIfFeatureEnabledProps {
  featureKey: keyof typeof featureFlags;
  children: React.ReactNode;
  fallback: React.ReactNode;
}
