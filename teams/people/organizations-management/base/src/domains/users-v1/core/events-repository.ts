import { UserV1Entity } from './entity';

export class UserV1AuthenticationEventDto {
  displayName: string;
  email: string;
  emailVerified: boolean;
  metadata: {
    createdAt: string;
    lastSignedInAt: string;
  };
  photoURL: string;
  providerData: Array<{
    displayName: string;
    email: string;
    photoURL: string;
    providerId: string;
    uid: string;
  }>;
  uid: string;
}

export abstract class UsersV1EventsRepository {
  public abstract publish(user: UserV1Entity): Promise<UserV1Entity>;
  public abstract authenticationEventToEntity(userV1AuthenticationEvent: UserV1AuthenticationEventDto): UserV1Entity;
}
