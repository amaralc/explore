import { IUserSession } from './types';

export interface IUserSessionRepository {
  useSession: () => IUserSession;
}
