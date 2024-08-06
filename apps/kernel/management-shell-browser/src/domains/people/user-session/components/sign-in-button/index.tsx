import { Box, Button, SxProps, useTheme } from '@mui/material';
import { alpha } from '@mui/material/styles';
import { FC, useState } from 'react';
import { ISignInButtonProps } from './types';

export const SsoSignInButton: FC<ISignInButtonProps> = ({ borderColor, icon, label, disabled, onClick }) => {
  const theme = useTheme();
  const [isComingSoon, setIsComingSoon] = useState(false);

  const handleMouseHover = (toggle: boolean) => {
    if (disabled) {
      setIsComingSoon(toggle);
    }
  };

  const variant = borderColor ? 'outlined' : 'contained';

  const sxProps: SxProps = {
    color: 'grey',
    borderColor: theme.palette.neutral[300],
    backgroundColor: theme.palette.common.white, // Change the color on hover
    '&:hover': {
      borderColor: borderColor ? alpha(borderColor, 0.3) : undefined,
      backgroundColor: theme.palette.neutral[100],
    },
  };

  return (
    <Box
      onMouseEnter={() => handleMouseHover(true)}
      onMouseLeave={() => handleMouseHover(false)}
      sx={{
        display: 'inline-block',
        cursor: 'not-allowed',
      }}
    >
      <Button fullWidth variant={variant} startIcon={icon} sx={sxProps} onClick={onClick} disabled={disabled}>
        {isComingSoon ? (
          <span
            style={{
              color: 'white',
              backgroundColor: 'orange',
              borderRadius: '12px',
              paddingRight: '8px',
              paddingLeft: '8px',
            }}
          >
            Coming Soon
          </span>
        ) : (
          label
        )}
      </Button>
    </Box>
  );
};
