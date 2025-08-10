import { ZitadelConfig, createZitadelAuth } from '@zitadel/react';
import { oidcConfig } from '../../../../config';

const config: ZitadelConfig = {
  authority: oidcConfig.authority, // ,'http://localhost:8080',
  client_id: oidcConfig.clientId,
  redirect_uri: oidcConfig.redirectUri, //'http://localhost:4200/auth/callback',
};

export const zitadel = createZitadelAuth(config);

export const zitadelLogin = () => {
  zitadel.authorize();
};

export const zitadelSignOut = () => {
  zitadel.signout();
};
