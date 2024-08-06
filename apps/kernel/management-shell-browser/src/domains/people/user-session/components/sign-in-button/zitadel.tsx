import { useAuth } from 'react-oidc-context';
import { SsoSignInButton } from '.';
import { ZitadelIcon } from '../icons/zitadel-icon';

export const ZitadelSignInButton = () => {
  const auth = useAuth();

  return (
    <SsoSignInButton
      label={'Continue with ZITADEL'}
      borderColor={'#ff8f00'}
      icon={<ZitadelIcon />}
      disabled={false}
      onClick={() => auth.signinRedirect()}
    />
  );
};
