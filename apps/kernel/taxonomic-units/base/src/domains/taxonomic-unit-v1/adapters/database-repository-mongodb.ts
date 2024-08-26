import { MongoDbDriver } from '@peerlab/kernel/shared-ts-utils/drivers/mongodb-driver';
import { IPaginatedEntitiesV2 } from '@peerlab/kernel/shared-ts-utils/paginated-entities';
import { Collection, MongoError, ObjectId } from 'mongodb';
import { ICreateManyResponseDto, IUpsertManyResponseDto } from '../../_shared/types';
import { TaxonomicUnitsV1DatabaseRepository } from '../core/database-repository';
import { IFilterTaxonomicUnitsV1InputDto } from '../core/database-repository.types';
import { ITaxonomicUnitV1 } from '../core/entity.schema.types';
import { UniqueTaxonomicUnitV1NameAndVersionError } from '../core/errors';

type IMongoDbTaxonomicUnitV1 = { _id: ObjectId } & Omit<ITaxonomicUnitV1, 'id'>;

export class MongoDbTaxonomicUnitsV1DatabaseRepository implements TaxonomicUnitsV1DatabaseRepository {
  mongoDbDriver: MongoDbDriver;
  collectionName = 'TaxonomicUnitV1';

  constructor(mongoDbDriver: MongoDbDriver) {
    this.mongoDbDriver = mongoDbDriver;
  }

  public async generateIndexes(): Promise<void> {
    await this.getCollection().createIndexes([{ key: { name: 1, version: 1 }, unique: true }]);
  }

  private getCollection(): Collection<IMongoDbTaxonomicUnitV1> {
    const collection = this.mongoDbDriver.getCollection<IMongoDbTaxonomicUnitV1>(this.collectionName);
    return collection;
  }

  private mapMongoDbToDomain({ _id, ...rest }: IMongoDbTaxonomicUnitV1): ITaxonomicUnitV1 {
    // We assume that what has been persisted once, is already valid so that it is not necessary to instantiate and validate again prior to returning to the caller
    const entityDto: ITaxonomicUnitV1 = {
      id: _id.toString(),
      ...rest,
    };

    return entityDto;
  }

  private mapDomainToMongoDb({ id, ...rest }: ITaxonomicUnitV1): IMongoDbTaxonomicUnitV1 {
    const mongoDbOrganization = {
      _id: new ObjectId(id),
      ...rest,
    };

    return mongoDbOrganization;
  }

  public generateUniqueId(): string {
    return new ObjectId().toString();
  }

  public async create(inputDto: ITaxonomicUnitV1): Promise<ITaxonomicUnitV1> {
    try {
      const mongoDbDto = this.mapDomainToMongoDb(inputDto);
      const result = await this.getCollection().insertOne(mongoDbDto);
      if (result.acknowledged === false) {
        throw new Error(`Failed to create ${this.collectionName}`);
      }

      const insertedDocument = await this.getCollection().findOne({ _id: result.insertedId });
      const entityDto = this.mapMongoDbToDomain(insertedDocument);
      return entityDto;
    } catch (error) {
      if (error instanceof MongoError && error.code === 11000) {
        throw new UniqueTaxonomicUnitV1NameAndVersionError(error.message);
      }
      throw error;
    }
  }

  public async createMany(inputDto: Array<ITaxonomicUnitV1>): Promise<ICreateManyResponseDto> {
    try {
      const mongoDbEntityDtoList = inputDto.map((entityDto) => this.mapDomainToMongoDb(entityDto));
      const result = await this.getCollection().insertMany(mongoDbEntityDtoList);

      if (!result.acknowledged) {
        throw new Error(`Failed to create ${this.collectionName} document`);
      }

      const insertedIds = Object.values(result.insertedIds).map((id) => id.toString());
      return { ids: insertedIds, count: result.insertedCount };
    } catch (error) {
      if (error instanceof MongoError && error.code === 11000) {
        throw new UniqueTaxonomicUnitV1NameAndVersionError(error.message);
      }

      throw error;
    }
  }

  public async upsertMany(inputDto: Array<ITaxonomicUnitV1>): Promise<IUpsertManyResponseDto> {
    const bulk = this.getCollection().initializeUnorderedBulkOp();

    inputDto.forEach((entityDto) => {
      const mongoDbDocument = this.mapDomainToMongoDb(entityDto);
      bulk.find({ _id: mongoDbDocument._id }).upsert().replaceOne(mongoDbDocument);
    });

    const result = await bulk.execute();
    if (!result.ok) {
      throw new Error(`Failed to upsert ${this.collectionName} documents`);
    }

    return {
      insertedIds: Object.values(result.insertedIds),
      insertedCount: result.insertedCount,
      upsertedIds: Object.values(result.upsertedIds),
      upsertedCount: result.upsertedCount,
    };
  }

  public async findManyByName(name: string): Promise<Array<ITaxonomicUnitV1>> {
    // Using $eq operator to avoid js injection attacks. The input was already validated in an upper layer but it is better to be sure we are safe in every layer.
    const mongoDbDocuments = await this.getCollection()
      .find({ name: { $eq: name } })
      .toArray();

    const entityDtoList = mongoDbDocuments.map((mongoDbDocument) => this.mapMongoDbToDomain(mongoDbDocument));

    return entityDtoList;
  }

  async findOneByNameAndVersion(name: string, version: number): Promise<ITaxonomicUnitV1> {
    const mongoDbDocument = await this.getCollection().findOne({ name: { $eq: name }, version: { $eq: version } });

    if (!mongoDbDocument) {
      return null;
    }

    const entityDto = this.mapMongoDbToDomain(mongoDbDocument);
    return entityDto;
  }

  public async findById(id: string): Promise<ITaxonomicUnitV1 | null> {
    const mongoDbDocument = await this.getCollection().findOne({ _id: new ObjectId(id) });
    if (!mongoDbDocument) {
      return null;
    }

    const entityDto = this.mapMongoDbToDomain(mongoDbDocument);
    return entityDto;
  }

  public async deleteById(id: string): Promise<void> {
    const deleteResult = await this.getCollection().deleteOne({ _id: new ObjectId(id) });
    if (!deleteResult.acknowledged) {
      throw new Error(`Failed to delete ${this.collectionName} document`);
    }
  }

  public async countAll(): Promise<number> {
    const count = await this.getCollection().countDocuments();
    return count;
  }

  public async filterPaginated({
    pagination,
    query,
  }: IFilterTaxonomicUnitsV1InputDto): Promise<IPaginatedEntitiesV2<ITaxonomicUnitV1>> {
    const mongoDbDocumentsList = await this.getCollection()
      .find(query, { limit: pagination.limit })
      .skip((pagination.page - 1) * pagination.limit)
      .toArray();

    const queryCount = await this.getCollection().countDocuments(query);
    const nextPage = queryCount > (pagination.page + 1) * pagination.limit ? pagination.page + 1 : null;
    const entityDtoList = mongoDbDocumentsList.map(this.mapMongoDbToDomain);
    return {
      entities: entityDtoList,
      nextPage,
      page: pagination.page,
      pageSize: pagination.limit,
    };
  }
}
