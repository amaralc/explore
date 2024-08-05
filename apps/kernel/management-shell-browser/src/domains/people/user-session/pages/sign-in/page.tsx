import { useState } from 'react';
import { useAuth } from 'react-oidc-context';
import { OauthSignInForm } from './oauth-sign-in-form';

export const SignInPage = () => {
  const auth = useAuth();
  const [hasTriedSignin, setHasTriedSignin] = useState(false);

  // // automatically sign-in
  // useEffect(() => {
  //   if (!hasAuthParams() && !auth.isAuthenticated && !auth.activeNavigator && !auth.isLoading && !hasTriedSignin) {
  //     auth.signinRedirect();
  //     setHasTriedSignin(true);
  //   }
  // }, [auth, hasTriedSignin]);

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
