import { UserManager } from 'oidc-client-ts';

export interface IOpenIdConnectCallbackProps {
  isAuthenticated: boolean | null;
  setAuth: (isAuthenticated: boolean | null) => void;
  userManager: UserManager;
  handleLogout: any;
}
