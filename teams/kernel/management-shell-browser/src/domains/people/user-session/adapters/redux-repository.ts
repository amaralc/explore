import { useAppDispatch, useAppSelector } from '../../../../redux-store';
import { IUser } from '../../user/types';
import { IUserSessionRepository } from '../repository';
import { userSessionSlice } from './redux-slice';

export const reduxUserSessionRepository: IUserSessionRepository = {
  useSession: () => useAppSelector((state) => state.userSession),
  useSetUserSession: (user: IUser | null) => useAppDispatch()(userSessionSlice.actions.setUserSession(user)),
};
