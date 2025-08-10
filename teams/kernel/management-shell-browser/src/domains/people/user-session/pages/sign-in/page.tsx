import { useAuth } from 'react-oidc-context';
import { OauthSignInForm } from './oauth-sign-in-form';

export const SignInPage = () => {
  const auth = useAuth();

  if (auth.isLoading) {
    return <div>Signing you in/out...</div>;
  }

  return (
    <div>
      <h1>Sign In</h1>
      <OauthSignInForm providers={['google', 'orcid', 'microsoft', 'passkey', 'saml-sso', 'zitadel']} />
    </div>
  );
};
