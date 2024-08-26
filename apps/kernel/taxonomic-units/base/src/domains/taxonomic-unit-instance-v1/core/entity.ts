import { schemaValidator } from '@peerlab/kernel/shared-ts-utils/validators/json-schema-validator';
import 'reflect-metadata';
import { HttpJsonSchemaOrgDraft04Schema } from '../../taxonomic-unit-v1/core/entity.schema.types';
import { ITaxonomicUnitInstanceV1 } from './entity.schema.types';

export class TaxonomicUnitInstanceV1Entity {
  private dto: ITaxonomicUnitInstanceV1;

  constructor(dataSchema: HttpJsonSchemaOrgDraft04Schema, inputDto: ITaxonomicUnitInstanceV1) {
    TaxonomicUnitInstanceV1Entity.validate(dataSchema, inputDto);
    this.dto = inputDto;
  }

  static validate(dataSchema: HttpJsonSchemaOrgDraft04Schema, inputDto: ITaxonomicUnitInstanceV1) {
    schemaValidator.validateOrReject(dataSchema, inputDto.data); // Validate data schema
  }

  getDto(): ITaxonomicUnitInstanceV1 {
    return this.dto;
  }
}
