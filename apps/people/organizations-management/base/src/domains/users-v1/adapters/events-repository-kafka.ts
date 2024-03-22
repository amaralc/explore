import { UserV1Entity } from '../core/entity';
import { UsersV1EventsRepository } from '../core/events-repository';

export class KafkaUsersV1EventsRepository extends UsersV1EventsRepository {
  constructor() {
    super();
    this.publish = this.publish.bind(this); // Bind the method to the instance
  }

  async publish(user: UserV1Entity): Promise<UserV1Entity> {
    console.log('Publishing user to Kafka...', user.id, '... Not implemented yet.');
    return user;
  }
}
