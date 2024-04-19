import { CreateManyResponseDto } from '@peerlab/kernel/shared-ts-utils/create-many-response-dto';
import { MongoDbDriver } from '@peerlab/kernel/shared-ts-utils/drivers/mongodb-driver';
import { IPaginatedEntities } from '@peerlab/kernel/shared-ts-utils/paginated-entities';
import { PaginationDto } from '@peerlab/kernel/shared-ts-utils/pagination-dto';
import { Collection, ObjectId } from 'mongodb';
import { ITaxonomicUnitV1Dto, TaxonomicUnitV1Entity } from '../core/entity';
import { TaxonomicUnitsV1DatabaseRepository } from '../core/repository-database';

type IMongoDbTaxonomicUnitV1 = { _id: ObjectId } & Omit<ITaxonomicUnitV1Dto, 'id'>;

export class MongoDbTaxonomicUnitsV1DatabaseRepository implements TaxonomicUnitsV1DatabaseRepository {
  mongoDbDriver: MongoDbDriver;
  collectionName = 'TaxonomicUnitV1';

  constructor(mongoDbDriver: MongoDbDriver) {
    this.mongoDbDriver = mongoDbDriver;
  }

  private getCollection(): Collection<IMongoDbTaxonomicUnitV1> {
    const collection = this.mongoDbDriver.getCollection<IMongoDbTaxonomicUnitV1>(this.collectionName);
    return collection;
  }

  private mapMongoDbToDomain({ _id, ...rest }: IMongoDbTaxonomicUnitV1): ITaxonomicUnitV1Dto {
    const entity = new TaxonomicUnitV1Entity({
      id: _id.toString(),
      ...rest,
    });

    const entityDto = entity.getDto();
    return entityDto;
  }

  private mapDomainToMongoDb({ id, ...rest }: ITaxonomicUnitV1Dto): IMongoDbTaxonomicUnitV1 {
    const mongoDbOrganization = {
      _id: new ObjectId(id),
      ...rest,
    };

    return mongoDbOrganization;
  }

  public generateUniqueId() {
    return new ObjectId().toString();
  }

  public async create(inputDto: TaxonomicUnitV1Entity): Promise<ITaxonomicUnitV1Dto> {
    const mongoDbDocument = this.mapDomainToMongoDb(inputDto);
    const result = await this.getCollection().insertOne(mongoDbDocument);

    if (result.acknowledged === false) {
      throw new Error('Failed to create taxonomic unit');
    }
    const insertedDocument = await this.getCollection().findOne({ _id: result.insertedId });
    const entityDto = this.mapMongoDbToDomain(insertedDocument);
    return entityDto;
  }

  public async createMany(agents: Array<TaxonomicUnitV1Entity>): Promise<CreateManyResponseDto> {
    const mongoDbDocuments = agents.map((agent) => this.mapDomainToMongoDb(agent));
    const result = await this.getCollection().insertMany(mongoDbDocuments);

    if (!result.acknowledged) {
      throw new Error('Failed to create agents');
    }

    const insertedIds = Object.values(result.insertedIds).map((id) => id.toString());
    return { ids: insertedIds, count: result.insertedCount };
  }

  public async findBySlug(slug: string): Promise<ITaxonomicUnitV1Dto | null> {
    const mongoDbDocument = await this.getCollection().findOne({ slug });
    if (!mongoDbDocument) {
      return null;
    }

    const entityDto = this.mapMongoDbToDomain(mongoDbDocument);
    return entityDto;
  }

  public async listPaginated(paginationDto: PaginationDto): Promise<IPaginatedEntities<ITaxonomicUnitV1Dto>> {
    const mongoDbDocuments = await this.getCollection()
      .find()
      .skip(paginationDto.page)
      .limit(paginationDto.limit)
      .toArray();

    const totalCount = await this.getCollection().countDocuments();

    const paginatedResult: IPaginatedEntities<ITaxonomicUnitV1Dto> = {
      currentPage: paginationDto.page,
      entities: mongoDbDocuments.map(this.mapMongoDbToDomain),
      total: totalCount,
      totalPages: Math.ceil(totalCount / paginationDto.limit),
    };

    return paginatedResult;
  }

  public async findById(id: string): Promise<ITaxonomicUnitV1Dto | null> {
    const mongoDbDocument = await this.getCollection().findOne({ _id: new ObjectId(id) });
    if (!mongoDbDocument) {
      return null;
    }

    const entityDto = this.mapMongoDbToDomain(mongoDbDocument);
    return entityDto;
  }

  public async generateIndexes(): Promise<void> {
    console.log('Generating indexes for TaxonomicUnitV1 collection');
    await this.getCollection().createIndexes([
      {
        key: { slug: 1 },
        unique: true,
      },
    ]);
  }
}
