import { getDtoFromEntity } from '@peerlab/kernel/shared-ts-utils/get-dto-from-entity';
import { schemaValidator } from '@peerlab/kernel/shared-ts-utils/validators/json-schema';
import multiInstitutionV1Schema from './entity.schema';
import { IMultiInstitutionV1Dto } from './entity.schema.types';

export class MultiInstitutionV1Entity {
  constructor(inputDto: IMultiInstitutionV1Dto) {
    MultiInstitutionV1Entity.validate(inputDto);
    Object.assign(this, inputDto);
  }

  static validate(inputDto: IMultiInstitutionV1Dto) {
    schemaValidator.validateOrReject(multiInstitutionV1Schema, inputDto);
  }

  getDto(): IMultiInstitutionV1Dto {
    const dto = getDtoFromEntity<IMultiInstitutionV1Dto>(this);
    return dto;
  }
}
