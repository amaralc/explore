import { UserV1Entity } from './entity';
import { UserV1AuthenticationEventDto, UsersV1EventsRepository } from './events-repository';

type IUsersChannels = {
  'users.v1': Record<string, UserV1Entity>;
};

export class InMemoryUsersV1EventsRepository implements UsersV1EventsRepository {
  private usersChannels: IUsersChannels = {
    'users.v1': {},
  };

  async publish(user: UserV1Entity): Promise<UserV1Entity> {
    this.usersChannels['users.v1'][user.id] = user;
    return user;
  }

  public authenticationEventToEntity(userV1AuthenticationEvent: UserV1AuthenticationEventDto): UserV1Entity {
    const userV1Entity = new UserV1Entity({
      createdAt: userV1AuthenticationEvent.metadata.createdAt,
      displayName: userV1AuthenticationEvent.displayName,
      email: userV1AuthenticationEvent.email,
      emailVerified: userV1AuthenticationEvent.emailVerified,
      id: userV1AuthenticationEvent.uid,
      photoURL: userV1AuthenticationEvent.photoURL,
      updatedAt: userV1AuthenticationEvent.metadata.lastSignedInAt,
      disabled: false,
    });
    return userV1Entity;
  }
}
