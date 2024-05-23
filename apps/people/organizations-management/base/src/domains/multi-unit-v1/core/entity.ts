import { getDtoFromEntity } from '@peerlab/kernel/shared-ts-utils/get-dto-from-entity';
import { schemaValidator } from '@peerlab/kernel/shared-ts-utils/validators/json-schema-validator';
import { Static, Type } from '@sinclair/typebox';

export const multiUnitV1Schema = Type.Object({
  id: Type.Integer({
    minimum: 0,
    maximum: 4294967295,
    description: 'The unique identifier of the unit as an integer',
  }),
  instituicao_id: Type.Integer({
    minimum: 0,
    maximum: 4294967295,
    description: 'The unique identifier of the institution that the unit belongs to as an integer',
  }),

  nome: Type.String({
    description: 'The name of the unit',
  }),
  sigla: Type.String({
    description: 'The acronym of the unit',
  }),
});

export type IMultiUnitV1Dto = Static<typeof multiUnitV1Schema>;

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
