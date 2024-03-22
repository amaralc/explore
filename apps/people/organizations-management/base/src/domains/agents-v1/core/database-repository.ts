import { IUserV1Dto } from '../../users-v1/core/entity';
import { AgentV1Entity, IAgentV1Dto } from './entity';

export class CreateManyResponseDto {
  ids: string[];
  count: number;
}

export abstract class AgentsV1DatabaseRepository {
  abstract generateUniqueId(): string;
  abstract createFromUserV1: (user: IUserV1Dto) => Promise<AgentV1Entity>;
  abstract create(agent: IAgentV1Dto): Promise<AgentV1Entity>;
  abstract createMany(agents: IAgentV1Dto[]): Promise<CreateManyResponseDto>;
  abstract getAgentById(id: string): Promise<AgentV1Entity>;
  abstract deleteById(id: string): Promise<void>;
  abstract findByEmail(email: string): Promise<Array<AgentV1Entity>>;
  abstract getByEmailAndType(email: string, type: IAgentV1Dto['type']): Promise<AgentV1Entity | null>;
}
