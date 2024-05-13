import { CreateManyResponseDto } from '../../_shared/types';
import { AgentV1Entity, IAgentV1Dto } from './entity';

export abstract class AgentsV1DatabaseRepository {
  abstract generateUniqueId(): string;
  abstract create(agent: IAgentV1Dto): Promise<AgentV1Entity>;
  abstract createMany(agents: IAgentV1Dto[]): Promise<CreateManyResponseDto>;
  abstract getAgentByNickname(nickname: string): Promise<IAgentV1Dto | null>;
  abstract getAgentById(id: string): Promise<AgentV1Entity | null>;
  abstract deleteById(id: string): Promise<void>;
  abstract findByEmail(email: string): Promise<Array<AgentV1Entity>>;
  abstract getByEmailAndType(email: string, type: IAgentV1Dto['type']): Promise<AgentV1Entity | null>;
  abstract generateIndexes(): Promise<void>;
}
