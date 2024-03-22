import { randomBytes } from 'crypto';
import { UserV1Entity } from '../../users-v1/core/entity';
import { AgentsV1DatabaseRepository, CreateManyResponseDto } from './database-repository';
import { AgentV1Entity, IAgentV1Dto } from './entity';

export class InMemoryAgentsV1Repository implements AgentsV1DatabaseRepository {
  private inMemoryAgentsV1: Array<AgentV1Entity> = [];

  generateUniqueId(): string {
    return randomBytes(12).toString('hex');
  }

  createFromUserV1(user: UserV1Entity): Promise<AgentV1Entity> {
    const agent = new AgentV1Entity({
      id: user.id,
      email: user.email,
      type: 'INDIVIDUAL',
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    });
    const persistedAgent = this.create(agent);
    return persistedAgent;
  }

  async create(agent: AgentV1Entity): Promise<AgentV1Entity> {
    this.inMemoryAgentsV1.push(agent);
    return agent;
  }

  async createMany(agents: AgentV1Entity[]): Promise<CreateManyResponseDto> {
    const uniqueAgents = [...new Set(agents)];
    if (uniqueAgents.length !== agents.length) {
      throw new Error('Agents must be unique');
    }

    const agentIds = agents.map((agent) => agent.id);
    for (const agent of agents) {
      this.inMemoryAgentsV1.push(agent);
    }

    return {
      ids: agentIds,
      count: agents.length,
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
}
