import { getDtoFromEntity } from '@peerlab/kernel/shared-ts-utils/get-dto-from-entity';
import { schemaValidator } from '@peerlab/kernel/shared-ts-utils/validators/json-schema-validator';
import multiUnitV1Schema from './entity.schema';
import { IMultiUnitV1Dto } from './entity.schema.types';

export class MultiUnitV1Entity {
  constructor(inputDto: IMultiUnitV1Dto) {
    MultiUnitV1Entity.validate(inputDto);
    Object.assign(this, inputDto);
  }

  static validate(inputDto: IMultiUnitV1Dto) {
    schemaValidator.validateOrReject(multiUnitV1Schema, inputDto);
  }

  getDto(): IMultiUnitV1Dto {
    const dto = getDtoFromEntity<IMultiUnitV1Dto>(this);
    return dto;
  }
}
