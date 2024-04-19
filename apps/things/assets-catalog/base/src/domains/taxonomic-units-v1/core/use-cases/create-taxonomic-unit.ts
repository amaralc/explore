import { ApplicationLogger } from '@peerlab/kernel/shared-ts-utils/logs/application-logger';
import { schemaValidator } from '@peerlab/kernel/shared-ts-utils/validators/json-schema-validator';
import { Static, Type } from '@sinclair/typebox';
import { ITaxonomicUnitV1Dto, TaxonomicUnitV1Entity, taxonomicUnitV1JsonSchema } from '../entity';
import { TaxonomicUnitsV1DatabaseRepository } from '../repository-database';
import { TaxonomicUnitAlreadyExistsError } from './create-taxonomic-unit.errors';

export const createTaxonomicUnitV1InputDtoSchema = Type.Object({
  slug: taxonomicUnitV1JsonSchema.properties.slug,
});

export type CreateTaxonomicUnitV1InputDto = Static<typeof createTaxonomicUnitV1InputDtoSchema>;

export class CreateTaxonomicUnitV1UseCase {
  constructor(
    private readonly taxonomicUnitsV1DatabaseRepository: TaxonomicUnitsV1DatabaseRepository,
    private readonly logger: ApplicationLogger,
  ) {
    this.logger.setLogScope({
      moduleName: 'taxonomic-units-v1',
      className: CreateTaxonomicUnitV1UseCase.name,
      methodName: 'constructor',
    });

    this.logger.log('Initializing CreateTaxonomicUnitV1UseCase...');
    this.taxonomicUnitsV1DatabaseRepository = taxonomicUnitsV1DatabaseRepository;
  }

  public async execute(inputDto: CreateTaxonomicUnitV1InputDto): Promise<ITaxonomicUnitV1Dto> {
    try {
      this.logger.setLogStep({ message: 'Validating input dto...' });
      schemaValidator.validateOrReject(createTaxonomicUnitV1InputDtoSchema, inputDto);

      this.logger.setLogStep({ message: 'Validating if taxonomic unit has unique slug...' });
      const existingTaxonomicUnitV1Dto = await this.taxonomicUnitsV1DatabaseRepository.findBySlug(inputDto.slug);
      if (existingTaxonomicUnitV1Dto) {
        throw new TaxonomicUnitAlreadyExistsError();
      }

      this.logger.setLogStep({ message: 'Creating a new taxonomic unit entity...' });
      const newTaxonomicUnitV1Entity = new TaxonomicUnitV1Entity({
        id: this.taxonomicUnitsV1DatabaseRepository.generateUniqueId(),
        slug: inputDto.slug,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });

      this.logger.setLogStep({ message: 'Storing taxonomic unit in repository...' });
      const taxonomicUnitV1Dto = await this.taxonomicUnitsV1DatabaseRepository.create(newTaxonomicUnitV1Entity);

      this.logger.log(`Taxonomic unit created: ${taxonomicUnitV1Dto.id}`);
      return taxonomicUnitV1Dto;
    } catch (error) {
      this.logger.error('Error while creating taxonomic unit', { error });
      throw error;
    }
  }
}
