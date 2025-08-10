import { CreateManyResponseDto } from '@peerlab/kernel/shared-ts-utils/create-many-response-dto';
import { MongoDbDriver } from '@peerlab/kernel/shared-ts-utils/drivers/mongodb-driver';
import { ILogMetadata } from '@peerlab/kernel/shared-ts-utils/logs/application-logger';
import { winstonLogger } from '@peerlab/kernel/shared-ts-utils/logs/winston-logger';
import { IPaginatedEntities } from '@peerlab/kernel/shared-ts-utils/paginated-entities';
import { IPaginationV1Dto } from '@peerlab/kernel/shared-ts-utils/pagination-dto';
import { Collection, MongoError, ObjectId } from 'mongodb';
import { TaxonomicUnitV1Entity } from '../core/entity';
import { ITaxonomicUnitV1Dto } from '../core/entity.schema.types';
import { TaxonomicUnitsV1DatabaseRepository } from '../core/repository-database';
import { TaxonomicUnitAlreadyExistsError } from '../core/use-cases/create-taxonomic-unit/errors';

type IMongoDbTaxonomicUnitV1 = { _id: ObjectId } & Omit<ITaxonomicUnitV1Dto, 'id'>;

export class MongoDbTaxonomicUnitsV1DatabaseRepository implements TaxonomicUnitsV1DatabaseRepository {
  private collectionName = 'TaxonomicUnitV1';

  constructor(private readonly mongoDbDriver: MongoDbDriver) {
    winstonLogger.info(`Successfully initialized ${this.constructor.name}`, {
      scope: {
        moduleName: 'things-assets-catalog-base',
        className: this.constructor.name,
      },
      steps: [],
    });
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
    try {
      const mongoDbDocument = this.mapDomainToMongoDb(inputDto);
      const result = await this.getCollection().insertOne(mongoDbDocument);

      if (result.acknowledged === false) {
        throw new Error('Failed to create taxonomic unit');
      }

      return inputDto;
    } catch (error) {
      if (error instanceof MongoError && error.code === 11000) {
        throw new TaxonomicUnitAlreadyExistsError();
      }
      throw error;
    }
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

  public async listPaginated(paginationDto: IPaginationV1Dto): Promise<IPaginatedEntities<ITaxonomicUnitV1Dto>> {
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
    const log: ILogMetadata = {
      scope: {
        moduleName: 'taxonomic-units-v1',
        className: MongoDbTaxonomicUnitsV1DatabaseRepository.name,
        methodName: 'execute',
      },
      steps: [],
    };
    try {
      log.steps.push({ message: 'Attempting to generate indexes for TaxonomicUnitV1 collection' });
      await this.getCollection().createIndexes([{ key: { slug: 1 }, unique: true }]);

      winstonLogger.info('Successfully generated indexes for TaxonomicUnitV1 collection');
    } catch (error) {
      log.steps.push({
        message: 'Failed to create indexes for TaxonomicUnitV1 collection',
        metadata: { errorStack: error.stack },
      });
      winstonLogger.error('Failed to create indexes for TaxonomicUnitV1 collection', log);
    }
  }

  public async deleteAll(): Promise<void> {
    await this.getCollection().deleteMany();
  }
}
