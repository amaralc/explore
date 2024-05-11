import { getDtoFromEntity } from '@peerlab/kernel/shared-ts-utils/get-dto-from-entity';
import { schemaValidator } from '@peerlab/kernel/shared-ts-utils/validators/json-schema-validator';
import { Static, Type } from '@sinclair/typebox';

export const multiInstitutionV1Schema = Type.Object({
  id: Type.Integer({
    minimum: 0,
    maximum: 4294967295,
    description: 'The unique identifier of a multi institution as an integer',
  }),
  nome: Type.String({
    description: 'The name of the multi institution',
  }),
  sigla: Type.String({
    description: 'The acronym of the multi institution',
  }),
  documento_institucional: Type.Union([
    Type.Null(),
    Type.String({
      description: 'The document of the multi institution',
    }),
  ]),
  link_numero_patrimonio: Type.Union([
    Type.Null(),
    Type.String({
      description: 'The link to the asset number of the multi institution',
    }),
  ]),
});

export type IMultiInstitutionV1Dto = Static<typeof multiInstitutionV1Schema>;

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
