import { AgentsV1DatabaseRepository } from '../../../../agents-v1/core/database-repository';
import { AgentV1Entity } from '../../../../agents-v1/core/entity';
import { UserV1AuthenticationEventDto, UsersV1EventsRepository } from '../../events-repository';

export class CreateAgentV1FromUserV1CreationEventUseCase {
  private agentsV1Repository: AgentsV1DatabaseRepository;
  private usersV1EventsRepository: UsersV1EventsRepository;

  constructor(agentsV1Repository: AgentsV1DatabaseRepository, usersV1EventsRepository: UsersV1EventsRepository) {
    this.agentsV1Repository = agentsV1Repository;
    this.usersV1EventsRepository = usersV1EventsRepository;
  }

  async execute(userCreatedEvent: UserV1AuthenticationEventDto): Promise<AgentV1Entity> {
    const userV1 = this.usersV1EventsRepository.authenticationEventToEntity(userCreatedEvent);

    // We expect this condition to be always false while using Firebase, but we are going to check it just in case we switch providers or something
    const agentV1WithSameEmail = await this.agentsV1Repository.getByEmailAndType(userV1.email, 'INDIVIDUAL');
    if (agentV1WithSameEmail) {
      throw new Error('Agent with same email already exists');
    }

    const agentV1 = await this.agentsV1Repository.createFromUserV1(userV1);
    return agentV1;
  }
}
