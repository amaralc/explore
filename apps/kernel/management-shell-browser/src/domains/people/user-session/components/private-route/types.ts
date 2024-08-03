import { IUserSessionRepository } from '../../repository';

export interface IPrivateRouteWrapperProps {
  element: React.ReactElement;
  userSessionRepository: IUserSessionRepository;
}
