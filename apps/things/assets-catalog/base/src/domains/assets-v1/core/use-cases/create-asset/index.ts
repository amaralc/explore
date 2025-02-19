import { ILogMetadata } from '@peerlab/kernel/shared-ts-utils/logs/application-logger';
import { winstonLogger } from '@peerlab/kernel/shared-ts-utils/logs/winston-logger';
import { schemaValidator } from '@peerlab/kernel/shared-ts-utils/validators/json-schema';
import { TaxonomicUnitV1NotFoundError } from '../../../../taxonomic-units-v1/core/errors';
import { TaxonomicUnitsV1DatabaseRepository } from '../../../../taxonomic-units-v1/core/repository-database';
import { AssetV1Entity } from '../../entity';
import { IAssetV1Dto } from '../../entity.schema.types';
import { AssetsV1DatabaseRepository } from '../../repository-database';
import createAssetV1InputDtoSchema from './input-dto.schema';
import { ICreateAssetV1InputDto } from './input-dto.schema.types';

export class CreateAssetV1UseCase {
  constructor(
    private readonly assetsV1DatabaseRepository: AssetsV1DatabaseRepository,
    private readonly taxonomicUnitsV1DatabaseRepository: TaxonomicUnitsV1DatabaseRepository,
  ) {
    const log: ILogMetadata = {
      scope: {
        moduleName: 'assets-v1',
        className: CreateAssetV1UseCase.name,
        methodName: 'constructor',
      },
      steps: [],
    };
    winstonLogger.info('Initializing CreateAssetV1UseCase...', log);
  }

  public async execute(inputDto: ICreateAssetV1InputDto): Promise<IAssetV1Dto> {
    const log: ILogMetadata = {
      scope: {
        moduleName: 'assets-v1',
        className: CreateAssetV1UseCase.name,
        methodName: 'execute',
      },
      steps: [],
    };
    try {
      log.steps.push({ message: 'Validating input dto...' });
      schemaValidator.validateOrReject(createAssetV1InputDtoSchema, inputDto);

      log.steps.push({ message: 'Validating if taxonomic unit is valid' });
      const existingTaxonomicUnitV1Dto = await this.taxonomicUnitsV1DatabaseRepository.findBySlug(
        inputDto.taxonomicUnitSlug,
      );

      if (!existingTaxonomicUnitV1Dto) {
        throw new TaxonomicUnitV1NotFoundError();
      }

      log.steps.push({ message: 'Creating a new asset entity...' });

      const assetV1Dto: IAssetV1Dto = {
        id: this.assetsV1DatabaseRepository.generateUniqueId(),
        name: inputDto.name,
        tags: inputDto.tags,
        taxonomicUnitSlug: inputDto.taxonomicUnitSlug,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      log.steps.push({ message: 'Validating asset entity...' });
      new AssetV1Entity(assetV1Dto);

      log.steps.push({ message: 'Storing asset in repository...' });
      const createdAssetDto = await this.assetsV1DatabaseRepository.create(assetV1Dto);

      winstonLogger.info(`Successfully created asset ${createdAssetDto.id}`);
      return createdAssetDto;
    } catch (error) {
      log.steps.push({ message: 'Error while creating asset', metadata: { errorStack: error.stack } });
      winstonLogger.error('Error while creating asset', log);
      throw error;
    }
  }
}
