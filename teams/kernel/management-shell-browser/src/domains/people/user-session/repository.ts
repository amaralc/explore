import { IUser } from '../user/types';
import { IUserSession } from './types';

export interface IUserSessionRepository {
  useSession: () => IUserSession;
  useSetUserSession: (user: IUser | null) => void;
}
