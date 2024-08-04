import { Button, SxProps, useTheme } from '@mui/material';
import { alpha } from '@mui/material/styles';
import { FC } from 'react';
import { ISignInButtonProps } from './types';

export const SsoSignInButton: FC<ISignInButtonProps> = ({ borderColor, icon, label, onClick }) => {
  const theme = useTheme();

  const variant = borderColor ? 'outlined' : 'contained';

  const sxProps: SxProps = {
    color: 'grey',
    borderColor: theme.palette.neutral[300],
    backgroundColor: theme.palette.common.white,
    '&:hover': {
      borderColor: borderColor ? alpha(borderColor, 0.3) : undefined,
      backgroundColor: theme.palette.neutral[100],
    },
  };

  return (
    <Button fullWidth variant={variant} startIcon={icon} sx={sxProps} onClick={onClick}>
      {label}
    </Button>
  );
};
