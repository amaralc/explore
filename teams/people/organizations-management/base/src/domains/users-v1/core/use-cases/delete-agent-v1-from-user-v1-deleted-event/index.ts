import { AgentsV1DatabaseRepository } from '../../../../agents-v1/core/database-repository';
import { UserV1AuthenticationEventDto } from '../../events-repository';

export class DeleteAgentV1FromUserV1DeletedEventUseCase {
  constructor(private agentsV1Repository: AgentsV1DatabaseRepository) {}

  async execute(userV1DeletedEvent: UserV1AuthenticationEventDto): Promise<void> {
    await this.agentsV1Repository.deleteById(userV1DeletedEvent.uid);
  }
}
