export interface FlaggedComponentProps {
  flagName: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}
