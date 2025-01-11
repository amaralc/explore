import { schemaValidator } from '@peerlab/kernel/shared-ts-utils/validators/json-schema';
import { ITaxonomicUnitV1 } from '../../taxonomic-unit-v1/core/entity.schema.types';

interface IInputDto {
  instanceData: unknown;
  taxonomicUnitV1Dto: ITaxonomicUnitV1;
}

export class TaxonomicUnitInstanceV1Entity {
  private dto: unknown;
  private taxonomicUnitV1Dto: ITaxonomicUnitV1;

  constructor(inputDto: IInputDto) {
    this.dto = inputDto.instanceData;
    this.taxonomicUnitV1Dto = inputDto.taxonomicUnitV1Dto;
  }

  validate() {
    this.validateDataFormat();
  }

  private validateDataFormat() {
    const entitySchema = this.taxonomicUnitV1Dto.instanceSchema;
    schemaValidator.validateOrReject(entitySchema, this.dto); // Validate data schema
  }

  getDto(): unknown {
    return this.dto;
  }
}
