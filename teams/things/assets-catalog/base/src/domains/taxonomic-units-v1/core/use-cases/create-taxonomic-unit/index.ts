import { ILogMetadata } from '@peerlab/kernel/shared-ts-utils/logs/application-logger';
import { winstonLogger } from '@peerlab/kernel/shared-ts-utils/logs/winston-logger';
import { schemaValidator } from '@peerlab/kernel/shared-ts-utils/validators/json-schema';
import { TaxonomicUnitV1Entity } from '../../entity';
import { ITaxonomicUnitV1Dto } from '../../entity.schema.types';
import { TaxonomicUnitsV1DatabaseRepository } from '../../repository-database';
import createTaxonomicUnitV1InputDtoSchema from './input-dto.schema';
import { ICreateTaxonomicUnitV1InputDto } from './input-dto.schema.types';

export class CreateTaxonomicUnitV1UseCase {
  constructor(private readonly taxonomicUnitsV1DatabaseRepository: TaxonomicUnitsV1DatabaseRepository) {
    const log: ILogMetadata = {
      scope: {
        moduleName: 'domains/taxonomic-units-v1',
        className: CreateTaxonomicUnitV1UseCase.name,
        methodName: 'constructor',
      },
      steps: [{ message: 'Initializing CreateTaxonomicUnitV1UseCase...' }],
    };

    winstonLogger.info('Initializing CreateTaxonomicUnitV1UseCase...', log);
  }

  public async execute(inputDto: ICreateTaxonomicUnitV1InputDto): Promise<ITaxonomicUnitV1Dto> {
    const log: ILogMetadata = {
      scope: {
        moduleName: 'domains/taxonomic-units-v1',
        className: CreateTaxonomicUnitV1UseCase.name,
        methodName: 'execute',
      },
      steps: [],
    };
    try {
      log.steps.push({ message: 'Validating input dto...' });
      schemaValidator.validateOrReject(createTaxonomicUnitV1InputDtoSchema, inputDto);

      log.steps.push({ message: 'Creating a new taxonomic unit entity...' });
      const newTaxonomicUnitV1Entity = new TaxonomicUnitV1Entity({
        id: this.taxonomicUnitsV1DatabaseRepository.generateUniqueId(),
        slug: inputDto.slug,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });

      log.steps.push({ message: 'Storing taxonomic unit in repository...' });
      const taxonomicUnitV1Dto = await this.taxonomicUnitsV1DatabaseRepository.create(newTaxonomicUnitV1Entity);

      winstonLogger.info(`Taxonomic unit created: ${taxonomicUnitV1Dto.id}`);
      return taxonomicUnitV1Dto;
    } catch (error) {
      log.steps.push({
        message: 'Error while creating taxonomic unit',
        metadata: { errorStack: error.stack, inputDto },
      });
      winstonLogger.error('Error while creating taxonomic unit', log);
      throw error;
    }
  }
}
