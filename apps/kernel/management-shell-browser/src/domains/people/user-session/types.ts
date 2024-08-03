import { IUser } from '../user/types';

export interface IUserSession {
  user: IUser | null;
  isAuthenticated: boolean;
}
