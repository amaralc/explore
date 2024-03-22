import { randomBytes } from 'crypto';
import { Collection } from 'mongodb';
import { MongoDbDriver } from '../../../database-drivers/mongodb-driver';
import { UserV1Entity } from '../../users-v1/core/entity';
import { AgentsV1DatabaseRepository, CreateManyResponseDto } from '../core/database-repository';
import { AgentV1Entity, IAgentV1Dto } from '../core/entity';

type IMongoDbAgentV1 = { _id: string } & Omit<IAgentV1Dto, 'id'>;

export class MongoDbAgentsV1DatabaseRepository implements AgentsV1DatabaseRepository {
  mongoDbDriver: MongoDbDriver;
  collectionName = 'AgentsV1';

  constructor(mongoDbDriver: MongoDbDriver) {
    this.mongoDbDriver = mongoDbDriver;
  }

  private getCollection(): Collection<IMongoDbAgentV1> {
    return this.mongoDbDriver.getCollection<IMongoDbAgentV1>(this.collectionName);
  }

  private mapMongoDbToDomain({ _id, ...rest }: IMongoDbAgentV1): AgentV1Entity {
    return new AgentV1Entity({
      id: _id.toString(),
      ...rest,
    });
  }

  private mapDomainToMongoDb({ id, ...rest }: IAgentV1Dto): IMongoDbAgentV1 {
    return {
      _id: id, // We are going to use the same id for both MongoDB and Firebase as string
      ...rest,
    };
  }

  public generateUniqueId(): string {
    return randomBytes(14).toString('hex'); // 28 characters (Firebase uid length)
  }

  public async create(inputDto: AgentV1Entity): Promise<AgentV1Entity> {
    const mongoDbAgent = this.mapDomainToMongoDb(inputDto);
    const result = await this.getCollection().insertOne(mongoDbAgent);
    if (!result.acknowledged) {
      throw new Error('Failed to create agent');
    }

    const insertedDocument = await this.getCollection().findOne({ _id: result.insertedId });
    const agent = this.mapMongoDbToDomain(insertedDocument);
    return agent;
  }

  public async createMany(agents: AgentV1Entity[]): Promise<CreateManyResponseDto> {
    const mongoDbAgents = agents.map((agent) => this.mapDomainToMongoDb(agent));
    const result = await this.getCollection().insertMany(mongoDbAgents);

    if (!result.acknowledged) {
      throw new Error('Failed to create agents');
    }

    const insertedIds = Object.values(result.insertedIds).map((id) => id.toString());
    return { ids: insertedIds, count: result.insertedCount };
  }

  public async createFromUserV1(user: UserV1Entity): Promise<AgentV1Entity> {
    const agent = new AgentV1Entity({
      id: user.id,
      email: user.email,
      type: 'INDIVIDUAL',
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    });

    const createdAgent = await this.create(agent);
    return createdAgent;
  }

  public async getAgentById(id: string): Promise<AgentV1Entity | null> {
    const agent = await this.getCollection().findOne({ _id: id });
    if (!agent) {
      return null;
    }

    const domainAgentV1 = this.mapMongoDbToDomain(agent);
    return domainAgentV1;
  }

  async findByEmail(email: string): Promise<Array<AgentV1Entity>> {
    const mongoDbAgentsV1 = await this.getCollection().find({ email });
    const domainAgentsV1 = (await mongoDbAgentsV1.toArray()).map(this.mapMongoDbToDomain);
    return domainAgentsV1;
  }

  async getByEmailAndType(email: string, type: IAgentV1Dto['type']): Promise<AgentV1Entity | null> {
    const agent = await this.getCollection().findOne({ email, type });
    if (!agent) {
      return null;
    }

    const domainAgentV1 = this.mapMongoDbToDomain(agent);
    return domainAgentV1;
  }

  public async deleteById(id: string): Promise<void> {
    const deleteResult = await this.getCollection().deleteOne({ _id: id });
    if (!deleteResult.acknowledged) {
      throw new Error('Failed to delete agent');
    }
  }
}
