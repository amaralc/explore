import { schemaValidator } from '@peerlab/kernel/shared-ts-utils/validators/json-schema-validator';
import { TaxonomicUnitsV1DatabaseRepository } from '../../../../taxonomic-unit-v1/core/database-repository';
import { TaxonomicUnitV1NotFoundError } from '../../../../taxonomic-unit-v1/core/errors';
import { TaxonomicUnitInstancesV1DatabaseRepository } from '../../database-repository';
import { TaxonomicUnitInstanceV1Entity } from '../../entity';
import createTaxonomicUnitV1InstanceJsonSchema from './input-dto.schema';
import { ICreateTaxonomicUnitV1InstanceInputDto } from './input-dto.schema.types';

export class CreateTaxonomicUnitV1InstanceUseCase {
  constructor(
    private readonly taxonomicUnitsV1DatabaseRepository: TaxonomicUnitsV1DatabaseRepository,
    private readonly taxonomicUnitInstancesV1DatabaseRepository: TaxonomicUnitInstancesV1DatabaseRepository,
  ) {}

  async execute(inputDto: ICreateTaxonomicUnitV1InstanceInputDto): Promise<unknown> {
    const taxonomicUnitV1Dto = await this.taxonomicUnitsV1DatabaseRepository.findOneByNameAndVersion(
      inputDto.schema.name,
      inputDto.schema.version,
    );

    if (!taxonomicUnitV1Dto) {
      throw new TaxonomicUnitV1NotFoundError(
        `Taxonomic unit with name ${inputDto.schema.name} and version ${inputDto.schema.version} was not found`,
      );
    }

    // Validate input dto
    schemaValidator.validateOrReject(createTaxonomicUnitV1InstanceJsonSchema, inputDto);

    // Create entity and validate data schema
    const id = this.taxonomicUnitInstancesV1DatabaseRepository.generateUniqueId();
    const entity = new TaxonomicUnitInstanceV1Entity(taxonomicUnitV1Dto.schema, {
      id,
      schema: inputDto.schema,
      data: inputDto.data,
    });

    // Get DTO
    const savedEntityDto = await this.taxonomicUnitInstancesV1DatabaseRepository.create(entity.getDto());
    return savedEntityDto;
  }
}
