import { schemaValidator } from '@peerlab/kernel/shared-ts-utils/validators/json-schema-validator';
import 'reflect-metadata';
import organizationV1JsonSchema from './entity.schema';
import { ITaxonomicUnitV1 } from './entity.schema.types';

export class TaxonomicUnitV1Entity {
  private dto: ITaxonomicUnitV1;

  constructor(inputDto: ITaxonomicUnitV1) {
    TaxonomicUnitV1Entity.validate(inputDto);
    this.dto = inputDto;
  }

  static validate(inputDto: ITaxonomicUnitV1) {
    schemaValidator.validateOrReject(organizationV1JsonSchema, inputDto);
  }

  getDto(): ITaxonomicUnitV1 {
    return this.dto;
  }
}
