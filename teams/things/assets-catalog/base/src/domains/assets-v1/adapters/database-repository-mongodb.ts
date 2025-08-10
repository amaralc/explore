import { CreateManyResponseDto } from '@peerlab/kernel/shared-ts-utils/create-many-response-dto';
import { MongoDbDriver } from '@peerlab/kernel/shared-ts-utils/drivers/mongodb-driver';
import { ILogMetadata } from '@peerlab/kernel/shared-ts-utils/logs/application-logger';
import { winstonLogger } from '@peerlab/kernel/shared-ts-utils/logs/winston-logger';
import { IPaginatedEntities } from '@peerlab/kernel/shared-ts-utils/paginated-entities';
import { IPaginationV1Dto } from '@peerlab/kernel/shared-ts-utils/pagination-dto';
import { Replace } from '@peerlab/kernel/shared-ts-utils/types/replace';
import { Collection, ObjectId } from 'mongodb';
import { AssetV1Entity } from '../core/entity';
import { IAssetV1Dto } from '../core/entity.schema.types';
import { AssetsV1DatabaseRepository } from '../core/repository-database';

type IAssetV1DtoWithDates = Replace<IAssetV1Dto, { createdAt: Date; updatedAt: Date }>;
type IMongoDbAssetV1 = { _id: ObjectId } & Omit<IAssetV1DtoWithDates, 'id'>;

export class MongoDbAssetsV1DatabaseRepository implements AssetsV1DatabaseRepository {
  private collectionName = 'AssetV1';

  constructor(private readonly mongoDbDriver: MongoDbDriver) {
    winstonLogger.info(`Successfully initialized ${this.constructor.name}`, {
      scope: {
        moduleName: 'things-assets-catalog-base',
        className: this.constructor.name,
      },
      steps: [],
    });
  }

  private getCollection(): Collection<IMongoDbAssetV1> {
    const collection = this.mongoDbDriver.getCollection<IMongoDbAssetV1>(this.collectionName);
    return collection;
  }

  private mapMongoDbToDomain({ _id, createdAt, updatedAt, ...rest }: IMongoDbAssetV1): IAssetV1Dto {
    const entity = new AssetV1Entity({
      id: _id.toString(),
      createdAt: createdAt.toISOString(),
      updatedAt: updatedAt.toISOString(),
      ...rest,
    });

    const entityDto = entity.getDto();
    return entityDto;
  }

  private mapDomainToMongoDb({ id, createdAt, updatedAt, ...rest }: IAssetV1Dto): IMongoDbAssetV1 {
    const mongoDbOrganization = {
      _id: new ObjectId(id),
      createdAt: new Date(createdAt),
      updatedAt: new Date(updatedAt),
      ...rest,
    };

    return mongoDbOrganization;
  }

  public generateUniqueId() {
    return new ObjectId().toString();
  }

  public async create(inputDto: IAssetV1Dto): Promise<IAssetV1Dto> {
    const mongoDbDocument = this.mapDomainToMongoDb(inputDto);
    const result = await this.getCollection().insertOne(mongoDbDocument);

    if (result.acknowledged === false) {
      throw new Error('Failed to create taxonomic unit');
    }
    const insertedDocument = await this.getCollection().findOne({ _id: result.insertedId });
    const entityDto = this.mapMongoDbToDomain(insertedDocument);
    return entityDto;
  }

  public async createMany(assetsV1DtoList: Array<IAssetV1Dto>): Promise<CreateManyResponseDto> {
    const mongoDbDocuments = assetsV1DtoList.map((agent) => this.mapDomainToMongoDb(agent));
    const result = await this.getCollection().insertMany(mongoDbDocuments);

    if (!result.acknowledged) {
      throw new Error('Failed to create assets');
    }

    const insertedIds = Object.values(result.insertedIds).map((id) => id.toString());
    return { ids: insertedIds, count: result.insertedCount };
  }

  public async findBySlug(slug: string): Promise<IAssetV1Dto | null> {
    const mongoDbDocument = await this.getCollection().findOne({ slug: { $eq: slug } });
    if (!mongoDbDocument) {
      return null;
    }

    const entityDto = this.mapMongoDbToDomain(mongoDbDocument);
    return entityDto;
  }

  public async listPaginated(paginationDto: IPaginationV1Dto): Promise<IPaginatedEntities<IAssetV1Dto>> {
    const mongoDbDocuments = await this.getCollection()
      .find()
      .skip(paginationDto.page)
      .limit(paginationDto.limit)
      .toArray();

    const totalCount = await this.getCollection().countDocuments();

    const paginatedResult: IPaginatedEntities<IAssetV1Dto> = {
      currentPage: paginationDto.page,
      entities: mongoDbDocuments.map(this.mapMongoDbToDomain),
      total: totalCount,
      totalPages: Math.ceil(totalCount / paginationDto.limit),
    };

    return paginatedResult;
  }

  public async findById(id: string): Promise<IAssetV1Dto | null> {
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
        moduleName: MongoDbAssetsV1DatabaseRepository.name,
        methodName: 'generateIndexes',
      },
      steps: [],
    };
    try {
      log.steps.push({ message: 'Attempting to generate indexes for AssetV1 collection' });
      await this.getCollection().createIndexes([
        {
          key: { slug: 1 },
          unique: true,
        },
      ]);
      winstonLogger.info('Successfully generated indexes for AssetV1 collection');
    } catch (error) {
      log.steps.push({
        message: 'Error while creating indexes for AssetV1 collection',
        metadata: {
          errorStack: error.stack,
        },
      });
      winstonLogger.error('Failed to create indexes for AssetV1 collection', log);
      throw error;
    }
  }
}
