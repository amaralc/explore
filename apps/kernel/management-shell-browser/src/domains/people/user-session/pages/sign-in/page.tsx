import { OauthSignInForm } from './oauth-sign-in-form';

export const SignInPage = () => {
  return (
    <div>
      <h1>Sign In</h1>
      <OauthSignInForm providers={['google', 'orcid', 'microsoft', 'passkey', 'saml-sso']} />
    </div>
  );
};
