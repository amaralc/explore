import { getDtoFromEntity } from '@peerlab/kernel/shared-ts-utils/get-dto-from-entity';
import { schemaValidator } from '@peerlab/kernel/shared-ts-utils/validators/json-schema-validator';
import taxonomicUnitV1JsonSchema from './entity.schema';
import { ITaxonomicUnitV1Dto } from './entity.schema.types';

export class TaxonomicUnitV1Entity implements ITaxonomicUnitV1Dto {
  id: string;
  slug: string;
  createdAt: string;
  updatedAt: string;

  constructor(inputDto: ITaxonomicUnitV1Dto) {
    TaxonomicUnitV1Entity.validate(inputDto);
    Object.assign(this, inputDto);
  }

  static validate(inputDto: ITaxonomicUnitV1Dto) {
    schemaValidator.validateOrReject(taxonomicUnitV1JsonSchema, inputDto);
  }

  getDto(): ITaxonomicUnitV1Dto {
    const dto = getDtoFromEntity<ITaxonomicUnitV1Dto>(this);
    return dto;
  }
}
