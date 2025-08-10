interface IMicrosoftIconProps {
  size?: number;
  color?: string;
}

export const MicrosoftIcon = ({ size = 24, color }: IMicrosoftIconProps) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 23 23" width={size} height={size}>
    <path fill="#f3f3f3" d="M0 0h23v23H0z" />
    <path fill={color || '#f35325'} d="M1 1h10v10H1z" />
    <path fill={color || '#81bc06'} d="M12 1h10v10H12z" />
    <path fill={color || '#0078d7'} d="M1 12h10v10H1z" />
    <path fill={color || '#ffba08'} d="M12 12h10v10H12z" />
  </svg>
);
