import { schemaValidator } from '@peerlab/kernel/shared-ts-utils/validators/json-schema';
import entitySchema from './entity.schema';
import { ITaxonomicUnitV1 } from './entity.schema.types';
import {
  ChildMetadataSchemaIsNotForwardCompatibleWithParentMetadataSchemaError,
  InvalidTaxonomicUnitV1InputDtoError,
  MetadataDoesNotMatchMetadataSchemaError
} from './errors';

export class TaxonomicUnitV1Entity {
  private dto: ITaxonomicUnitV1;
  private parentDto: ITaxonomicUnitV1;

  constructor(inputDto: ITaxonomicUnitV1, parentDto: ITaxonomicUnitV1 = null) {
    this.dto = inputDto;
    this.parentDto = parentDto;
    this.inheritMetadataSchemaOrFail();
  }

  validate() {
    this.validateInputDto();
    this.validateMetadata();
    return this;
  }

  validateInputDto() {
    const { errors, errorsText } = schemaValidator.validate(entitySchema, this.dto);
    if (errors.length > 0) {
      throw new InvalidTaxonomicUnitV1InputDtoError(errorsText);
    }
  }

  validateMetadata() {
    const { errors, errorsText } = schemaValidator.validate(this.dto.metadataSchema, this.dto.metadata);
    if (errors.length > 0) {
      throw new MetadataDoesNotMatchMetadataSchemaError(errorsText);
    }
  }

  inheritMetadataSchemaOrFail() {
    if (!this.parentDto) {
      return;
    }

    const parentMetadataSchema = this.parentDto.metadataSchema;
    const childMetadataSchema = this.dto.metadataSchema;

    // Check if root schema types are compatible
    const { errors, errorsText } = schemaValidator.checkForwardCompatibility(parentMetadataSchema, childMetadataSchema)
    if (errors.length > 0) {
      throw new ChildMetadataSchemaIsNotForwardCompatibleWithParentMetadataSchemaError(errorsText);
    }
  }

  getDto(): ITaxonomicUnitV1 {
    return this.dto;
  }

  getParentDto(): ITaxonomicUnitV1 {
    return this.parentDto;
  }
}
