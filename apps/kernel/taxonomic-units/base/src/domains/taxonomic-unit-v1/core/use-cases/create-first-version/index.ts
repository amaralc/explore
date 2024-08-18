import { ILogMetadata } from '@peerlab/kernel/shared-ts-utils/logs/application-logger';
import { winstonLogger } from '@peerlab/kernel/shared-ts-utils/logs/winston-logger';
import { schemaValidator } from '@peerlab/kernel/shared-ts-utils/validators/json-schema-validator';
import { TaxonomicUnitsV1DatabaseRepository } from '../../database-repository';
import { TaxonomicUnitV1Entity } from '../../entity';

import { ITaxonomicUnitV1 } from '../../entity.schema.types';
import { DuplicatedTaxonomicUnitV1NameError, UniqueTaxonomicUnitV1NameAndVersionError } from '../../errors';
import schema from './input-dto.schema';
import { ICreateFirstVersionOfTaxonomicUnitV1InputDto } from './input-dto.schema.types';

export class CreateFirstVersionOfTaxonomicUnitV1UseCase {
  private taxonomicUnitsV1DatabaseRepository: TaxonomicUnitsV1DatabaseRepository;
  private entityName = 'TaxonomicUnitV1';
  private entityTitle = 'Taxonomic Unit';

  constructor(taxonomicUnitsV1DatabaseRepository: TaxonomicUnitsV1DatabaseRepository) {
    this.taxonomicUnitsV1DatabaseRepository = taxonomicUnitsV1DatabaseRepository;
  }

  public async execute(inputDto: ICreateFirstVersionOfTaxonomicUnitV1InputDto): Promise<ITaxonomicUnitV1> {
    const log: ILogMetadata = {
      scope: {
        moduleName: CreateFirstVersionOfTaxonomicUnitV1UseCase.name,
        methodName: 'execute',
      },
      steps: [],
    };
    try {
      log.steps.push({ message: 'Validate input dto' });
      schemaValidator.validateOrReject(schema, inputDto);

      log.steps.push({ message: 'Find one by name by name', metadata: { name: inputDto.name } });
      const entityDtoWithSameName = await this.taxonomicUnitsV1DatabaseRepository.findOneByName(inputDto.name);
      if (entityDtoWithSameName !== null) {
        throw new DuplicatedTaxonomicUnitV1NameError(
          `${this.entityTitle} with name '${inputDto.name}' already exists. If you want to version your entity, use the resource /v1/taxonomic-units/${entityDtoWithSameName.id}/versions`,
        );
      }

      log.steps.push({ message: 'Create entity' });
      const newEntity = new TaxonomicUnitV1Entity({
        id: this.taxonomicUnitsV1DatabaseRepository.generateUniqueId(),
        name: inputDto.name,
        schema: inputDto.schema,
        version: 1,
      });

      log.steps.push({ message: 'Save first version in entity repository' });
      const entityDto = await this.taxonomicUnitsV1DatabaseRepository.create(newEntity.getDto());

      winstonLogger.info(`${this.entityName} created`, log);
      return entityDto;
    } catch (error) {
      if (error instanceof UniqueTaxonomicUnitV1NameAndVersionError) {
        log.steps.push({
          message: error.message,
          metadata: { stack: error.stack, errorName: 'UniqueTaxonomicUnitV1NameAndVersionError' },
        });
      }

      winstonLogger.error(`Error creating ${this.entityName}`, log);
      throw error;
    }
  }
}
