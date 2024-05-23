import { getDtoFromEntity } from '@peerlab/kernel/shared-ts-utils/get-dto-from-entity';
import { schemaValidator } from '@peerlab/kernel/shared-ts-utils/validators/json-schema-validator';
import { Static, Type } from '@sinclair/typebox';

export const multiDepartmentV1Schema = Type.Object({
  id: Type.Integer({
    minimum: 0,
    maximum: 4294967295,
    description: 'The unique identifier of the department as an integer',
  }),
  instituicao_id: Type.Integer({
    minimum: 0,
    maximum: 4294967295,
    description: 'The unique identifier of the institution that the department belongs to as an integer',
  }),
  unidade_id: Type.Integer({
    minimum: 0,
    maximum: 4294967295,
    description: 'The unique identifier of the unit that the department belongs to as an integer',
  }),
  nome: Type.String({
    description: 'The name of the department',
  }),
});

export type IMultiDepartmentV1Dto = Static<typeof multiDepartmentV1Schema>;

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
