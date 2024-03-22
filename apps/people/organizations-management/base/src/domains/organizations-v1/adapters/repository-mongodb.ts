import { Collection, ObjectId } from 'mongodb';
import { MongoDbDriver } from '../../../database-drivers/mongodb-driver';
import { IPaginatedEntities } from '../../../utils/paginated-entities';
import { PaginationDto } from '../../../utils/pagination-dto';
import { IOrganizationV1Dto, OrganizationV1Entity } from '../core/entity';
import { OrganizationsV1Repository } from '../core/repository';

type IMongoDbOrganization = { _id: ObjectId } & Omit<IOrganizationV1Dto, 'id'>;

export class MongoDbOrganizationsV1Repository implements OrganizationsV1Repository {
  mongoDbDriver: MongoDbDriver;
  collectionName = 'OrganizationsV1';

  constructor(mongoDbDriver: MongoDbDriver) {
    this.mongoDbDriver = mongoDbDriver;
  }

  private getCollection(): Collection<IMongoDbOrganization> {
    const collection = this.mongoDbDriver.getCollection<IMongoDbOrganization>(this.collectionName);
    return collection;
  }

  private mapMongoDbToDomain({ _id, ...rest }: IMongoDbOrganization): OrganizationV1Entity {
    const domainOrganizationV1 = new OrganizationV1Entity({
      id: _id.toString(),
      ...rest,
    });

    return domainOrganizationV1;
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

  public async create(inputDto: OrganizationV1Entity): Promise<OrganizationV1Entity> {
    const mongoDbOrganization = this.mapDomainToMongoDb(inputDto);
    const result = await this.getCollection().insertOne(mongoDbOrganization);
    if (result.acknowledged === false) {
      throw new Error('Failed to create organization');
    }

    const insertedDocument = await this.getCollection().findOne({ _id: result.insertedId });
    const domainOrganizationV1 = this.mapMongoDbToDomain(insertedDocument);
    return domainOrganizationV1;
  }

  public async findByNickname(nickname: string): Promise<OrganizationV1Entity | null> {
    const organization = await this.getCollection().findOne({ nickname });
    if (!organization) {
      return null;
    }

    const domainOrganizationV1 = this.mapMongoDbToDomain(organization);
    return domainOrganizationV1;
  }

  async findByEmail(email: string): Promise<OrganizationV1Entity> {
    const organization = await this.getCollection().findOne({ email });
    if (!organization) {
      return null;
    }

    const domainOrganizationV1 = this.mapMongoDbToDomain(organization);
    return domainOrganizationV1;
  }

  public async listPaginated(paginationDto: PaginationDto): Promise<IPaginatedEntities<OrganizationV1Entity>> {
    const entities = await this.getCollection().find().skip(paginationDto.page).limit(paginationDto.limit).toArray();
    const totalCount = await this.getCollection().countDocuments();
    const paginatedResult: IPaginatedEntities<OrganizationV1Entity> = {
      currentPage: paginationDto.page,
      entities: entities.map(this.mapMongoDbToDomain),
      total: totalCount,
      totalPages: Math.ceil(totalCount / paginationDto.limit),
    };

    return paginatedResult;
  }

  public async findById(id: string): Promise<OrganizationV1Entity | null> {
    const organization = await this.getCollection().findOne({ _id: new ObjectId(id) });
    if (!organization) {
      return null;
    }

    const domainOrganizationV1 = this.mapMongoDbToDomain(organization);
    return domainOrganizationV1;
  }

  public async getOrganizationsByOwnerId(id: string): Promise<OrganizationV1Entity[]> {
    const organizations = await this.getCollection().find({ ownerAgentId: id }).toArray();
    const domainOrganizations = organizations.map(this.mapMongoDbToDomain);
    return domainOrganizations;
  }
}
