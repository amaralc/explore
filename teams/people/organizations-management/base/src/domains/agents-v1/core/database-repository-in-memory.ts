import { randomBytes } from 'crypto';
import { ICreateManyResponseDto, IUpsertManyResponseDto } from '../../_shared/types';
import { AgentsV1DatabaseRepository } from './database-repository';
import { AgentV1Entity } from './entity';
import { IAgentV1Dto } from './entity.schema.types';

export class InMemoryAgentsV1Repository implements AgentsV1DatabaseRepository {
  private inMemoryAgentsV1: Array<AgentV1Entity> = [];

  generateUniqueId(): string {
    return randomBytes(14).toString('hex');
  }

  listAll(): Promise<Array<IAgentV1Dto>> {
    throw new Error('Method not implemented.');
  }

  async generateIndexes() {
    console.log('No indexes to generate when using in-memory repository');
  }

  async getAgentByNickname(nickname: string): Promise<IAgentV1Dto | null> {
    const existingAgent = this.inMemoryAgentsV1.find((agent) => agent.nickname === nickname);
    if (!existingAgent) {
      return null;
    }

    return existingAgent;
  }

  async create(inputDto: AgentV1Entity): Promise<AgentV1Entity> {
    const agentWithSameNickname = this.inMemoryAgentsV1.find((agent) => inputDto.nickname === agent.nickname);
    if (agentWithSameNickname) {
      throw Error('Duplicated key. Agent with same nickname already exist.');
    }

    const agentWithSameEmailAndType = this.inMemoryAgentsV1.find(
      (agent) => inputDto.email === agent.email && inputDto.type === agent.type,
    );

    if (agentWithSameEmailAndType) {
      throw Error('Duplicated key. Agent with same email and type already exist.');
    }

    this.inMemoryAgentsV1.push(inputDto);
    return inputDto;
  }

  async createMany(agents: AgentV1Entity[]): Promise<ICreateManyResponseDto> {
    const uniqueAgents = [...new Set(agents)];
    if (uniqueAgents.length !== agents.length) {
      throw new Error('Agents must be unique'); // TODO: fix this rule that is more strict than the one applied in the "create" method
    }

    const agentIds = agents.map((agent) => agent.id);
    for (const agent of agents) {
      this.create(agent);
    }

    return {
      ids: agentIds,
      count: agents.length,
    };
  }

  async upsertMany(agents: AgentV1Entity[]): Promise<IUpsertManyResponseDto> {
    const insertedIds = [];
    const upsertedIds = [];
    for (const agent of agents) {
      const existingAgent = this.inMemoryAgentsV1.find((existingAgent) => existingAgent.id === agent.id);
      if (existingAgent) {
        this.deleteById(agent.id);
        upsertedIds.push(agent.id);
      } else {
        insertedIds.push(agent.id);
      }
      this.create(agent);
    }

    return {
      insertedIds,
      insertedCount: insertedIds.length,
      upsertedIds,
      upsertedCount: upsertedIds.length,
    };
  }

  async getAgentById(id: string): Promise<AgentV1Entity> {
    const user = this.inMemoryAgentsV1.find((agent) => agent.id === id);
    return user || null;
  }

  async findByEmail(email: string): Promise<Array<AgentV1Entity>> {
    const agents = this.inMemoryAgentsV1.filter((agent) => agent.email === email);
    return agents;
  }

  async getByEmailAndType(email: string, type: IAgentV1Dto['type']): Promise<AgentV1Entity | null> {
    const agentsByEmail = this.inMemoryAgentsV1.filter((agent) => agent.email === email);
    const agentsByType = agentsByEmail.find((agent) => agent.type === type);
    return agentsByType || null;
  }

  async deleteById(id: string): Promise<void> {
    this.inMemoryAgentsV1 = this.inMemoryAgentsV1.filter((agent) => agent.id !== id);
  }

  async countAll(): Promise<number> {
    return this.inMemoryAgentsV1.length;
  }
}
