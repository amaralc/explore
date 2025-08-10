import { UserV1AuthenticationEventDto } from '../core/events-repository';

type IBackgroundFunctionEventTypes =
  | 'providers/firebase.auth/eventTypes/user.create'
  | 'providers/firebase.auth/eventTypes/user.delete';

export type IBackgroundFunctionEventContext = {
  eventId: string;
  eventType: IBackgroundFunctionEventTypes;
  notSupported: unknown;
  resource: string;
  timestamp: string;
};

export type IBackgroundFunction = (
  eventData: UserV1AuthenticationEventDto,
  context: IBackgroundFunctionEventContext,
  callback: () => void,
) => void;
