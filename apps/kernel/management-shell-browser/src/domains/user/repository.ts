import { IUser } from './types';

export interface IUserSessionRepository {
  useUser: () => IUser;
}
