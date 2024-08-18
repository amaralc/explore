import { getDtoFromEntity } from '@peerlab/kernel/shared-ts-utils/get-dto-from-entity';
import { schemaValidator } from '@peerlab/kernel/shared-ts-utils/validators/json-schema-validator';
import 'reflect-metadata';
import organizationV1JsonSchema from './entity.schema';
import { ITaxonomicUnitV1 } from './entity.schema.types';

export class TaxonomicUnitV1Entity implements ITaxonomicUnitV1 {
  name: string;
  schema: ITaxonomicUnitV1['schema'];
  version: number;

  constructor(inputDto: ITaxonomicUnitV1) {
    // Validate
    TaxonomicUnitV1Entity.validate(inputDto);
    Object.assign(this, inputDto);
  }

  static validate(inputDto: ITaxonomicUnitV1) {
    schemaValidator.validateOrReject(organizationV1JsonSchema, inputDto);
  }

  getDto(): ITaxonomicUnitV1 {
    const dto = getDtoFromEntity<ITaxonomicUnitV1>(this);
    return dto;
  }
}
