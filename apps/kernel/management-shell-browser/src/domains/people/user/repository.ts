import { IUser } from './types';

export interface IUserRepository {
  useUser: () => IUser;
}
