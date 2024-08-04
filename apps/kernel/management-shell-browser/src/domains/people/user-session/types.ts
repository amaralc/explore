import { IUser } from '../user/types';

export interface IUserSession {
  user: IUser | null;
  isAuthenticated: boolean;
}

export type ISignInMethod = 'google' | 'orcid' | 'microsoft' | 'passkey' | 'saml-sso' | 'zitadel';
