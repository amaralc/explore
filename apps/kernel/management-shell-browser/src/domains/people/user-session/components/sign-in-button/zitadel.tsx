import { ZitadelConfig, createZitadelAuth } from '@zitadel/react';
import { SsoSignInButton } from '.';
import { zitadelConfig } from '../../../../../config';
import { ZitadelIcon } from '../icons/zitadel-icon';

export const ZitadelSignInButton = () => {
  const config: ZitadelConfig = {
    authority: zitadelConfig.authority, // ,'http://localhost:8080',
    client_id: zitadelConfig.clientId,
    redirect_uri: zitadelConfig.redirectUri, //'http://localhost:4200/auth/callback',
  };

  const zitadel = createZitadelAuth(config);

  const zitadelLogin = () => {
    zitadel.authorize();
  };

  return (
    <SsoSignInButton
      label={'Continue with ZITADEL'}
      borderColor={'#ff8f00'}
      icon={<ZitadelIcon />}
      onClick={() => zitadelLogin()}
    />
  );
};
