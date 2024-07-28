import { ICreateManyResponseDto, IUpsertManyResponseDto } from '../../_shared/types';
import { IAgentV1Dto } from './entity';

export abstract class AgentsV1DatabaseRepository {
  abstract generateUniqueId(): string;
  abstract create(agent: IAgentV1Dto): Promise<IAgentV1Dto>;
  abstract createMany(agents: IAgentV1Dto[]): Promise<ICreateManyResponseDto>;
  abstract upsertMany(agents: IAgentV1Dto[]): Promise<IUpsertManyResponseDto>;
  abstract getAgentByNickname(nickname: string): Promise<IAgentV1Dto | null>;
  abstract getAgentById(id: string): Promise<IAgentV1Dto | null>;
  abstract deleteById(id: string): Promise<void>;
  abstract findByEmail(email: string): Promise<Array<IAgentV1Dto>>;
  abstract getByEmailAndType(email: string, type: IAgentV1Dto['type']): Promise<IAgentV1Dto | null>;
  abstract generateIndexes(): Promise<void>;
  abstract listAll(): Promise<Array<IAgentV1Dto>>;
  abstract countAll(): Promise<number>;
}
