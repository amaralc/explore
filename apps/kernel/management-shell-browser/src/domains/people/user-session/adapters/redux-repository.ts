import { useAppSelector } from '../../../../redux-store';
import { IUserSessionRepository } from '../repository';

export const reduxUserSessionRepository: IUserSessionRepository = {
  useSession: () => useAppSelector((state) => state.userSession),
};
