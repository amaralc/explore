import { IUserSessionRepository } from '../../repository';

export interface IOpenIdConnectAuthCallbackProps {
  userSessionRepository: IUserSessionRepository;
}
