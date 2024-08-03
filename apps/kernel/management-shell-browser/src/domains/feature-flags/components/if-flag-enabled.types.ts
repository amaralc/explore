export interface IfFlagEnabledProps {
  flagName: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}
