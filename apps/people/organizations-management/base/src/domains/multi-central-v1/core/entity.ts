import { getDtoFromEntity } from '@peerlab/kernel/shared-ts-utils/get-dto-from-entity';
import { schemaValidator } from '@peerlab/kernel/shared-ts-utils/validators/json-schema-validator';
import multiCentralV1Schema from './entity.schema';
import { IMultiCentralV1Dto } from './entity.schema.types';

export class MultiCentralV1Entity {
  constructor(inputDto: IMultiCentralV1Dto) {
    MultiCentralV1Entity.validate(inputDto);
    Object.assign(this, inputDto);
  }

  static validate(inputDto: IMultiCentralV1Dto) {
    schemaValidator.validateOrReject(multiCentralV1Schema, inputDto);
  }

  getDto(): IMultiCentralV1Dto {
    const dto = getDtoFromEntity<IMultiCentralV1Dto>(this);
    return dto;
  }
}
