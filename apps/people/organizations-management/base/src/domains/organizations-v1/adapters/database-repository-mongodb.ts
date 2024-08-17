import { MongoDbDriver } from '@peerlab/kernel/shared-ts-utils/drivers/mongodb-driver';
import { IPaginatedEntities, IPaginatedEntitiesV2 } from '@peerlab/kernel/shared-ts-utils/paginated-entities';
import { IPaginationV1Dto } from '@peerlab/kernel/shared-ts-utils/pagination-dto';
import { Collection, ObjectId } from 'mongodb';
import { ICreateManyResponseDto, IUpsertManyResponseDto } from '../../_shared/types';
import { OrganizationsV1DatabaseRepository } from '../core/database-repository';
import { IFilterOrganizationV1InputDto } from '../core/database-repository.types';
import { OrganizationV1Entity } from '../core/entity';
import { IOrganizationV1Dto } from '../core/entity.schema.types';

type IMongoDbOrganization = { _id: ObjectId } & Omit<IOrganizationV1Dto, 'id'>;

export class MongoDbOrganizationsV1Repository implements OrganizationsV1DatabaseRepository {
  mongoDbDriver: MongoDbDriver;
  collectionName = 'OrganizationsV1';

  constructor(mongoDbDriver: MongoDbDriver) {
    this.mongoDbDriver = mongoDbDriver;
  }

  public async generateIndexes(): Promise<void> {
    await this.getCollection().createIndexes([
      {
        key: { nickname: 1 },
        unique: true,
      },
      {
        key: { idPath: 1 },
        unique: true,
      },
      { key: { agentId: 1 }, unique: true },
      {
        key: { ownerAgentId: 1 },
      },
    ]);
  }

  private getCollection(): Collection<IMongoDbOrganization> {
    const collection = this.mongoDbDriver.getCollection<IMongoDbOrganization>(this.collectionName);
    return collection;
  }

  private mapMongoDbToDomain({ _id, ...rest }: IMongoDbOrganization): IOrganizationV1Dto {
    const domainOrganizationV1 = new OrganizationV1Entity({
      id: _id.toString(),
      ...rest,
    });

    return domainOrganizationV1.getDto();
  }

  private mapDomainToMongoDb({ id, ...rest }: IOrganizationV1Dto): IMongoDbOrganization {
    const mongoDbOrganization = {
      _id: new ObjectId(id),
      ...rest,
    };

    return mongoDbOrganization;
  }

  public generateUniqueId() {
    return new ObjectId().toString();
  }

  public async create(inputDto: IOrganizationV1Dto): Promise<IOrganizationV1Dto> {
    const mongoDbOrganization = this.mapDomainToMongoDb(inputDto);
    const result = await this.getCollection().insertOne(mongoDbOrganization);
    if (result.acknowledged === false) {
      throw new Error('Failed to create organization');
    }

    const insertedDocument = await this.getCollection().findOne({ _id: result.insertedId });
    const domainOrganizationV1 = this.mapMongoDbToDomain(insertedDocument);
    return domainOrganizationV1;
  }

  public async createMany(inputDto: Array<IOrganizationV1Dto>): Promise<ICreateManyResponseDto> {
    const mongoDbOrganizations = inputDto.map((organization) => this.mapDomainToMongoDb(organization));
    const result = await this.getCollection().insertMany(mongoDbOrganizations);

    if (!result.acknowledged) {
      throw new Error('Failed to create organizations');
    }

    const insertedIds = Object.values(result.insertedIds).map((id) => id.toString());
    return { ids: insertedIds, count: result.insertedCount };
  }

  public async upsertMany(inputDto: Array<IOrganizationV1Dto>): Promise<IUpsertManyResponseDto> {
    const bulk = this.getCollection().initializeUnorderedBulkOp();

    inputDto.forEach((entityDto) => {
      const mongoDbDocument = this.mapDomainToMongoDb(entityDto);
      bulk.find({ _id: mongoDbDocument._id }).upsert().replaceOne(mongoDbDocument);
    });

    const result = await bulk.execute();
    if (!result.ok) {
      throw new Error('Failed to upsert organizations');
    }

    return {
      insertedIds: Object.values(result.insertedIds),
      insertedCount: result.insertedCount,
      upsertedIds: Object.values(result.upsertedIds),
      upsertedCount: result.upsertedCount,
    };
  }

  public async findByNickname(nickname: string): Promise<IOrganizationV1Dto | null> {
    const organization = await this.getCollection().findOne({ nickname });
    if (!organization) {
      return null;
    }

    const domainOrganizationV1 = this.mapMongoDbToDomain(organization);
    return domainOrganizationV1;
  }

  async findByEmail(email: string): Promise<Array<IOrganizationV1Dto>> {
    const organizations = await this.getCollection().find({ email }).toArray();

    const domainOrganizationsV1 = organizations.map(this.mapMongoDbToDomain);
    return domainOrganizationsV1;
  }

  public async listPaginated(paginationDto: IPaginationV1Dto): Promise<IPaginatedEntities<IOrganizationV1Dto>> {
    const entities = await this.getCollection()
      .find()
      .skip((paginationDto.page - 1) * paginationDto.limit)
      .limit(paginationDto.limit)
      .toArray();
    const totalCount = await this.getCollection().countDocuments();
    const paginatedResult: IPaginatedEntities<IOrganizationV1Dto> = {
      currentPage: paginationDto.page,
      entities: entities.map(this.mapMongoDbToDomain),
      total: totalCount,
      totalPages: Math.ceil(totalCount / paginationDto.limit),
    };

    return paginatedResult;
  }

  public async findById(id: string): Promise<IOrganizationV1Dto | null> {
    const organization = await this.getCollection().findOne({ _id: new ObjectId(id) });
    if (!organization) {
      return null;
    }

    const domainOrganizationV1 = this.mapMongoDbToDomain(organization);
    return domainOrganizationV1;
  }

  public async findByAgentId(agentId: string): Promise<IOrganizationV1Dto | null> {
    const organization = await this.getCollection().findOne({ agentId });
    if (!organization) {
      return null;
    }

    return this.mapMongoDbToDomain(organization);
  }

  public async getOrganizationsByOwnerId(id: string): Promise<Array<IOrganizationV1Dto>> {
    const organizations = await this.getCollection().find({ ownerAgentId: id }).toArray();
    const domainOrganizations = organizations.map(this.mapMongoDbToDomain);
    return domainOrganizations;
  }

  public async deleteById(id: string): Promise<void> {
    const deleteResult = await this.getCollection().deleteOne({ _id: new ObjectId(id) });
    if (!deleteResult.acknowledged) {
      throw new Error('Failed to delete agent');
    }
  }

  public async countAll(): Promise<number> {
    const count = await this.getCollection().countDocuments();
    return count;
  }

  public async filterPaginated({
    pagination,
    query,
  }: IFilterOrganizationV1InputDto): Promise<IPaginatedEntitiesV2<IOrganizationV1Dto>> {
    const organizations = await this.getCollection()
      .find(query, { limit: pagination.limit })
      .skip((pagination.page - 1) * pagination.limit)
      .toArray();

    const queryCount = await this.getCollection().countDocuments(query);
    const nextPage = queryCount > (pagination.page + 1) * pagination.limit ? pagination.page + 1 : null;
    const domainOrganizations = organizations.map(this.mapMongoDbToDomain);
    return {
      entities: domainOrganizations,
      nextPage,
      page: pagination.page,
      pageSize: pagination.limit,
    };
  }
}
