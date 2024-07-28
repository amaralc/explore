import { MongoDbDriver } from '@peerlab/kernel/shared-ts-utils/drivers/mongodb-driver';
import { randomBytes } from 'crypto';
import { Collection } from 'mongodb';
import { ICreateManyResponseDto, IUpsertManyResponseDto } from '../../_shared/types';
import { AgentsV1DatabaseRepository } from '../core/database-repository';
import { AgentV1Entity, IAgentV1Dto } from '../core/entity';

type IMongoDbAgentV1 = { _id: string } & Omit<IAgentV1Dto, 'id'>; // We are going to use the same id for both MongoDB and Firebase as string

export class MongoDbAgentsV1DatabaseRepository implements AgentsV1DatabaseRepository {
  mongoDbDriver: MongoDbDriver;
  collectionName = 'AgentsV1';

  constructor(mongoDbDriver: MongoDbDriver) {
    this.mongoDbDriver = mongoDbDriver;
  }

  private getCollection(): Collection<IMongoDbAgentV1> {
    return this.mongoDbDriver.getCollection<IMongoDbAgentV1>(this.collectionName);
  }

  private mapMongoDbToDomain({ _id, ...rest }: IMongoDbAgentV1): IAgentV1Dto {
    const entity = new AgentV1Entity({
      id: _id.toString(),
      ...rest,
    });

    const entityDto = entity.getDto();
    return entityDto;
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

  public async generateIndexes(): Promise<void> {
    await this.getCollection().createIndexes([
      {
        key: { nickname: 1 },
        unique: true,
      },
    ]);
  }

  public async create(inputDto: IAgentV1Dto): Promise<IAgentV1Dto> {
    const mongoDbAgent = this.mapDomainToMongoDb(inputDto);
    const result = await this.getCollection().insertOne(mongoDbAgent);
    if (!result.acknowledged) {
      throw new Error('Failed to create agent');
    }

    const collection = this.getCollection();
    const insertedDocument = await collection.findOne({ _id: result.insertedId });
    const agent = this.mapMongoDbToDomain(insertedDocument);
    return agent;
  }

  public async createMany(agents: Array<IAgentV1Dto>): Promise<ICreateManyResponseDto> {
    const mongoDbAgents = agents.map((agent) => this.mapDomainToMongoDb(agent));
    const result = await this.getCollection().insertMany(mongoDbAgents);

    if (!result.acknowledged) {
      throw new Error('Failed to create agents');
    }

    const insertedIds = Object.values(result.insertedIds).map((id) => id.toString());
    return { ids: insertedIds, count: result.insertedCount };
  }

  public async upsertMany(agents: Array<IAgentV1Dto>): Promise<IUpsertManyResponseDto> {
    const bulk = this.getCollection().initializeUnorderedBulkOp();
    agents.forEach((agent) => {
      const mongoDbAgent = this.mapDomainToMongoDb(agent);
      bulk.find({ _id: agent.id }).upsert().replaceOne(mongoDbAgent);
    });

    const result = await bulk.execute();
    if (!result.ok) {
      throw new Error('Failed to upsert agents');
    }

    return {
      insertedIds: Object.values(result.insertedIds),
      insertedCount: result.insertedCount,
      upsertedIds: Object.values(result.upsertedIds),
      upsertedCount: result.upsertedCount,
    };
  }

  public async getAgentById(id: string): Promise<IAgentV1Dto | null> {
    const agent = await this.getCollection().findOne({ _id: id });
    if (!agent) {
      return null;
    }

    const domainAgentV1 = this.mapMongoDbToDomain(agent);
    return domainAgentV1;
  }

  async findByEmail(email: string): Promise<Array<IAgentV1Dto>> {
    const mongoDbAgentsV1 = await this.getCollection().find({ email }).toArray();
    const domainAgentsV1 = mongoDbAgentsV1.map(this.mapMongoDbToDomain);
    return domainAgentsV1;
  }

  async getAgentByNickname(nickname: string): Promise<IAgentV1Dto | null> {
    const mongoDbAgentV1 = await this.getCollection().findOne({ nickname });
    if (!mongoDbAgentV1) {
      return null;
    }

    const domainAgentV1 = this.mapMongoDbToDomain(mongoDbAgentV1);
    return domainAgentV1;
  }

  async getByEmailAndType(email: string, type: IAgentV1Dto['type']): Promise<IAgentV1Dto | null> {
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

  public async listAll(): Promise<Array<IAgentV1Dto>> {
    throw new Error('Method not implemented');
  }

  public async countAll(): Promise<number> {
    const count = await this.getCollection().countDocuments();
    return count;
  }
}
