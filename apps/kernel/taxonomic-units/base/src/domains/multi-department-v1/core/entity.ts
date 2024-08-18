import { getDtoFromEntity } from '@peerlab/kernel/shared-ts-utils/get-dto-from-entity';
import { schemaValidator } from '@peerlab/kernel/shared-ts-utils/validators/json-schema-validator';
import multiDepartmentV1Schema from './entity.schema';
import { IMultiDepartmentV1Dto } from './entity.schema.types';

export class MultiDepartmentV1Entity {
  constructor(inputDto: IMultiDepartmentV1Dto) {
    MultiDepartmentV1Entity.validate(inputDto);
    Object.assign(this, inputDto);
  }

  static validate(inputDto: IMultiDepartmentV1Dto) {
    schemaValidator.validateOrReject(multiDepartmentV1Schema, inputDto);
  }

  getDto(): IMultiDepartmentV1Dto {
    const dto = getDtoFromEntity<IMultiDepartmentV1Dto>(this);
    return dto;
  }
}
