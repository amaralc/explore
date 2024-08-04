import { ZitadelConfig, createZitadelAuth } from '@zitadel/react';
import { zitadelConfig } from '../../../../config';

const config: ZitadelConfig = {
  authority: zitadelConfig.authority, // ,'http://localhost:8080',
  client_id: zitadelConfig.clientId,
  redirect_uri: zitadelConfig.redirectUri, //'http://localhost:4200/auth/callback',
};

export const zitadel = createZitadelAuth(config);

export const zitadelLogin = () => {
  zitadel.authorize();
};

export const zitadelSignOut = () => {
  zitadel.signout();
};
