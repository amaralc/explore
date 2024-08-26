import { MongoDbDriver } from '@peerlab/kernel/shared-ts-utils/drivers/mongodb-driver';
import { Collection, ObjectId } from 'mongodb';
import { ICreateManyResponseDto, IUpsertManyResponseDto } from '../../_shared/types';
import { TaxonomicUnitInstancesV1DatabaseRepository } from '../core/database-repository';
import { ITaxonomicUnitInstanceV1 } from '../core/entity.schema.types';

type IMongoDbTaxonomicUnitInstanceV1 = { _id: ObjectId } & Omit<ITaxonomicUnitInstanceV1, 'id'>;

export class MongoDbTaxonomicUnitInstancesV1DatabaseRepository implements TaxonomicUnitInstancesV1DatabaseRepository {
  mongoDbDriver: MongoDbDriver;
  collectionName = 'TaxonomicUnitInstanceV1';

  constructor(mongoDbDriver: MongoDbDriver) {
    this.mongoDbDriver = mongoDbDriver;
  }

  private mapMongoDbToDomain({ _id, ...rest }: IMongoDbTaxonomicUnitInstanceV1): ITaxonomicUnitInstanceV1 {
    // We assume that what has been persisted once, is already valid so that it is not necessary to instantiate and validate again prior to returning to the caller
    const entityDto: ITaxonomicUnitInstanceV1 = {
      id: _id.toString(),
      ...rest,
    };

    return entityDto;
  }

  private mapDomainToMongoDb({ id, ...rest }: ITaxonomicUnitInstanceV1): IMongoDbTaxonomicUnitInstanceV1 {
    const mongoDbOrganization = {
      _id: new ObjectId(id),
      ...rest,
    };

    return mongoDbOrganization;
  }

  private getCollection(): Collection<IMongoDbTaxonomicUnitInstanceV1> {
    const collection = this.mongoDbDriver.getCollection<IMongoDbTaxonomicUnitInstanceV1>(this.collectionName);
    return collection;
  }

  public generateUniqueId(): string {
    return new ObjectId().toString();
  }

  generateIndexes(): Promise<void> {
    throw new Error('Method not implemented.');
  }

  countAll(): Promise<number> {
    throw new Error('Method not implemented.');
  }

  deleteById(id: string): Promise<void> {
    throw new Error('Method not implemented.');
  }

  async create(inputDto: ITaxonomicUnitInstanceV1): Promise<ITaxonomicUnitInstanceV1> {
    const mongoDbDto = this.mapDomainToMongoDb(inputDto);
    const result = await this.getCollection().insertOne(mongoDbDto);
    if (result.acknowledged === false) {
      throw new Error(`Failed to create ${this.collectionName}`);
    }

    const insertedDocument = await this.getCollection().findOne({ _id: result.insertedId });
    const entityDto = this.mapMongoDbToDomain(insertedDocument);
    return entityDto;
  }

  createMany(inputDto: ITaxonomicUnitInstanceV1[]): Promise<ICreateManyResponseDto> {
    throw new Error('Method not implemented.');
  }

  findById(id: string): Promise<ITaxonomicUnitInstanceV1> {
    throw new Error('Method not implemented.');
  }

  findManyByName(name: string): Promise<ITaxonomicUnitInstanceV1[]> {
    throw new Error('Method not implemented.');
  }

  findManyByNameAndVersion(name: string, version: number): Promise<ITaxonomicUnitInstanceV1> {
    throw new Error('Method not implemented.');
  }

  upsertMany(inputDto: ITaxonomicUnitInstanceV1[]): Promise<IUpsertManyResponseDto> {
    throw new Error('Method not implemented.');
  }
}
