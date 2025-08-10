import { UserV1Entity } from '../core/entity';
import { UserV1AuthenticationEventDto, UsersV1EventsRepository } from '../core/events-repository';

export class FirebaseUsersV1EventsRepository extends UsersV1EventsRepository {
  public authenticationEventToEntity(userV1AuthenticationEvent: UserV1AuthenticationEventDto): UserV1Entity {
    const userV1Entity = new UserV1Entity({
      createdAt: new Date(userV1AuthenticationEvent.metadata.createdAt).toISOString(),
      displayName: userV1AuthenticationEvent.displayName,
      email: userV1AuthenticationEvent.email,
      emailVerified: userV1AuthenticationEvent.emailVerified,
      id: userV1AuthenticationEvent.uid,
      photoURL: userV1AuthenticationEvent.photoURL,
      updatedAt: new Date(userV1AuthenticationEvent.metadata.lastSignedInAt).toISOString(),
      disabled: false,
    });
    return userV1Entity;
  }

  public publish(user: UserV1Entity): Promise<UserV1Entity> {
    throw new Error('Method not implemented.');
  }
}
