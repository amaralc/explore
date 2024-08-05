import KeyIcon from '@mui/icons-material/Key';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import { Box, Container, Divider, Stack, useTheme } from '@mui/material';
import { FC } from 'react';
import { GoogleIcon } from '../../components/icons/google-icon';
import { MicrosoftIcon } from '../../components/icons/microsoft-icon';
import { OrcidIcon } from '../../components/icons/orcid-icon';
import { SsoSignInButton } from '../../components/sign-in-button';
import { ZitadelSignInButton } from '../../components/sign-in-button/zitadel';
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
            <SsoSignInButton
              label={'Continue with Google'}
              borderColor={'#EA4335'}
              icon={<GoogleIcon />}
              onClick={() => console.log('google')}
            />
          )}

          {providers.includes('orcid') && (
            <SsoSignInButton
              label={'Continue with ORCID'}
              borderColor={'#a6ce39'}
              icon={<OrcidIcon />}
              onClick={() => console.log('orcid')}
            />
          )}

          {providers.includes('microsoft') && (
            <SsoSignInButton
              label={'Continue with Microsoft'}
              borderColor={'#05a6f0'}
              icon={<MicrosoftIcon />}
              onClick={() => console.log('microsoft')}
            />
          )}

          {providers.includes('zitadel') && <ZitadelSignInButton />}

          {providers.includes('passkey') || providers.includes('saml-sso') ? <Divider /> : null}

          {providers.includes('passkey') && (
            <SsoSignInButton
              label={'Login with Passkey'}
              borderColor={theme.palette.common.black}
              icon={<KeyIcon />}
              onClick={() => console.log('passkey')}
            />
          )}

          {providers.includes('saml-sso') && (
            <SsoSignInButton
              label={'Login with SAML SSO'}
              borderColor={theme.palette.common.black}
              icon={<LockOutlinedIcon />}
              onClick={() => console.log('saml-sso')}
            />
          )}
        </Stack>
      </Box>
    </Container>
  );
};
