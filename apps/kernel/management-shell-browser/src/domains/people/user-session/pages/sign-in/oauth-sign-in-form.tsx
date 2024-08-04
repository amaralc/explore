import KeyIcon from '@mui/icons-material/Key';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import { Box, Button, Container, Divider, Stack, useTheme } from '@mui/material';
import { FC } from 'react';
import { GoogleIcon } from '../../components/icons/google-icon';
import { MicrosoftIcon } from '../../components/icons/microsoft-icon';
import { OrcidIcon } from '../../components/icons/orcid-icon';
import { IOauthSignInFormProps } from './oauth-sign-in-form.types';

export const OauthSignInForm: FC<IOauthSignInFormProps> = ({ providers }) => {
  const theme = useTheme();
  return (
    <Container component="main" maxWidth="xs">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Stack spacing={2} width={340}>
          {providers.includes('google') && (
            <Button
              fullWidth
              variant="outlined"
              startIcon={<GoogleIcon />}
              sx={{
                color: 'grey',
                borderColor: theme.palette.neutral[300],
                backgroundColor: theme.palette.common.white,
                '&:hover': {
                  borderColor: '#EA4335',
                  backgroundColor: theme.palette.neutral[100],
                },
              }}
            >
              Continue with Google
            </Button>
          )}

          {providers.includes('orcid') && (
            <Button
              fullWidth
              variant="outlined"
              startIcon={<OrcidIcon />}
              sx={{
                color: 'grey',
                borderColor: theme.palette.neutral[300],
                backgroundColor: theme.palette.common.white,
                '&:hover': {
                  borderColor: '#a6ce39',
                  backgroundColor: theme.palette.neutral[100],
                },
              }}
            >
              Continue with ORCID
            </Button>
          )}

          {providers.includes('microsoft') && (
            <Button
              fullWidth
              variant="outlined"
              startIcon={<MicrosoftIcon />}
              sx={{
                color: 'grey',
                borderColor: theme.palette.neutral[300],
                backgroundColor: theme.palette.common.white,
                '&:hover': {
                  borderColor: '#05a6f0',
                  backgroundColor: theme.palette.neutral[100],
                },
              }}
            >
              Continue with Microsoft
            </Button>
          )}

          {providers.includes('passkey') || providers.includes('saml-sso') ? <Divider /> : null}

          {providers.includes('passkey') && (
            <Button
              fullWidth
              variant="contained"
              startIcon={<KeyIcon />}
              sx={{
                backgroundColor: theme.palette.common.white,
                color: 'grey',
                '&:hover': {
                  backgroundColor: theme.palette.neutral[100],
                },
              }}
            >
              Login with Passkey
            </Button>
          )}

          {providers.includes('saml-sso') && (
            <Button
              fullWidth
              variant="contained"
              startIcon={<LockOutlinedIcon />}
              sx={{
                backgroundColor: theme.palette.common.white,
                color: 'grey',
                '&:hover': {
                  backgroundColor: theme.palette.neutral[100],
                },
              }}
            >
              Login with SAML SSO
            </Button>
          )}
        </Stack>
      </Box>
    </Container>
  );
};
