import { ILogMetadata } from '@peerlab/kernel/shared-ts-utils/logs/application-logger';
import { winstonLogger } from '@peerlab/kernel/shared-ts-utils/logs/winston-logger';
import { schemaValidator } from '@peerlab/kernel/shared-ts-utils/validators/json-schema-validator';
import { TaxonomicUnitsV1DatabaseRepository } from '../../database-repository';
import { TaxonomicUnitV1Entity } from '../../entity';

import { ITaxonomicUnitV1 } from '../../entity.schema.types';
import { DuplicatedTaxonomicUnitV1NameError, ParentTaxonomicUnitNotFoundError } from '../../errors';
import schema from './input-dto.schema';
import { ICreateFirstVersionOfTaxonomicUnitV1InputDto } from './input-dto.schema.types';

export class CreateFirstVersionOfTaxonomicUnitV1UseCase {
  private readonly taxonomicUnitsV1DatabaseRepository: TaxonomicUnitsV1DatabaseRepository;
  private readonly entityName = 'TaxonomicUnitV1';
  private readonly entityTitle = 'Taxonomic Unit';

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

      log.steps.push({ message: 'Find one by name', metadata: { name: inputDto.name } });
      const entityDtoList = await this.taxonomicUnitsV1DatabaseRepository.findManyByName(inputDto.name);
      if (entityDtoList.length > 0) {
        throw new DuplicatedTaxonomicUnitV1NameError(
          `${this.entityTitle} with name '${inputDto.name}' already exists. If you want to version your entity, use the resource /v1/taxonomic-units/${inputDto.name}/versions`,
        );
      }

      log.steps.push({ message: 'Create entity' });
      const newId = this.taxonomicUnitsV1DatabaseRepository.generateUniqueId();
      let lineageIdPath = `/${newId}`;

      if (inputDto.parentId) {
        const parentEntityDto = await this.taxonomicUnitsV1DatabaseRepository.findById(inputDto.parentId);

        if (!parentEntityDto) {
          throw new ParentTaxonomicUnitNotFoundError(
            `Parent taxonomic unit with id '${inputDto.parentId}' was not found`,
          );
        }

        lineageIdPath = parentEntityDto.lineageIdPath + '/' + newId;
      }

      const newEntity = new TaxonomicUnitV1Entity({
        id: newId,
        name: inputDto.name,
        schema: inputDto.schema,
        version: 1,
        lineageIdPath: lineageIdPath,
      });

      log.steps.push({ message: 'Save first version in entity repository' });
      const entityDto = await this.taxonomicUnitsV1DatabaseRepository.create(newEntity.getDto());

      winstonLogger.info(`${this.entityName} created`, log);
      return entityDto;
    } catch (error) {
      log.steps.push({
        message: error.message,
        metadata: { stack: error.stack },
      });

      winstonLogger.error(`Error creating ${this.entityName}`, log);
      throw error;
    }
  }
}
