import { getDtoFromEntity } from '@peerlab/kernel/shared-ts-utils/get-dto-from-entity';
import { CustomEnum } from '@peerlab/kernel/shared-ts-utils/types/custom-enum';
import { schemaValidator } from '@peerlab/kernel/shared-ts-utils/validators/json-schema-validator';
import { Static, Type } from '@sinclair/typebox';
import { multiDepartmentV1Schema } from '../../multi-department-v1/core/entity';
import { multiInstitutionV1Schema } from '../../multi-institution-v1/core/entity';
import { multiUnitV1Schema } from '../../multi-unit-v1/core/entity';

export const multiCentralV1Schema = Type.Object({
  id: Type.Integer({
    minimum: 0,
    maximum: 4294967295,
    description: 'The unique identifier of a multi central as an integer',
  }),
  instituicao_id: Type.Integer({
    minimum: 0,
    maximum: 4294967295,
    description: 'The unique identifier of the institution that the multi central belongs to as an integer',
  }),
  unidade_id: Type.Integer({
    minimum: 0,
    maximum: 4294967295,
    description: 'The unique identifier of the unit that the multi central belongs to as an integer',
  }),
  departamento_id: Type.Union([
    Type.Null(),
    Type.Integer({
      minimum: 0,
      maximum: 4294967295,
      description: 'The unique identifier of the department that the multi central belongs to as an integer',
    }),
  ]),
  nome: Type.String({
    description: 'The name of the multi central',
  }),
  sigla: Type.String({
    description: 'The acronym of the multi central',
  }),
  site: Type.Union([
    Type.Null(),
    Type.String({
      description: 'The website of the multi central',
    }),
  ]),
  email: Type.String({
    description: 'The email of the multi central',
    format: 'email',
  }),
  telefone1: Type.String({
    description: 'The first phone number of the multi central',
  }),
  telefone2: Type.Union([
    Type.Null(),
    Type.String({
      description: 'The second phone number of the multi central',
    }),
  ]),
  endereco_id: Type.Union([
    Type.Null(),
    Type.Integer({
      minimum: 0,
      maximum: 4294967295,
      description: 'The unique identifier of the address that the multi central belongs to as an integer',
    }),
  ]),
  como_chegar: Type.Union([
    Type.Null(),
    Type.String({
      description: 'The how to get to the multi central',
    }),
  ]),
  sobre: Type.Union([
    Type.Null(),
    Type.String({
      description: 'The about of the multi central',
    }),
  ]),
  horario_atendimento: Type.Union([
    Type.Null(),
    Type.String({
      description: 'The opening hours of the multi central',
    }),
  ]),
  observacoes: Type.Union([
    Type.Null(),
    Type.String({
      description: 'The observations of the multi central',
    }),
  ]),
  tesouraria: Type.Boolean({
    description: 'The flag that indicates if the multi central is a treasury',
  }),
  passo_atual: Type.Integer({
    minimum: 0,
    maximum: 4294967295,
    description: 'The current step of the multi central as an integer',
  }),
  central_status_id: Type.Integer({
    minimum: 0,
    maximum: 4294967295,
    description: 'The unique identifier of the status of the multi central as an integer',
  }),
  foto_arquivo_id: Type.Union([
    Type.Null(),
    Type.Integer({
      minimum: 0,
      maximum: 4294967295,
      description: 'The unique identifier of the photo file of the multi central as an integer',
    }),
  ]),
  created: Type.String({
    description: 'The creation date of the multi central',
  }),
  created_by: Type.Integer({
    minimum: 0,
    maximum: 4294967295,
    description: 'The unique identifier of the user that created the multi central as an integer',
  }),
  updated: Type.String({
    description: 'The last update date of the multi central',
  }),
  updated_by: Type.Integer({
    minimum: 0,
    maximum: 4294967295,
    description: 'The unique identifier of the user that updated the multi central as an integer',
  }),
  deleted: Type.Null(),
  instituicao: multiInstitutionV1Schema,
  unidade: multiUnitV1Schema,
  departamento: Type.Union([Type.Null(), multiDepartmentV1Schema]),
  foto: Type.Union([
    Type.Null(),
    Type.Object({
      id: Type.Integer({
        minimum: 0,
        maximum: 4294967295,
        description: 'The unique identifier of the photo as an integer',
      }),
      nome_original: Type.String({
        description: 'The original name of the photo',
      }),
      nome_final: Type.String({
        description: 'The final name of the photo',
      }),
      path: Type.String({
        description: 'The path of the photo',
      }),
      encoding: CustomEnum(['7bit'], {
        description: 'The encoding of the photo',
      }),
      mimetype: CustomEnum(['image/jpeg', 'image/png'], {
        description: 'The mimetype of the photo',
      }),
      tamanho: Type.Integer({
        minimum: 0,
        maximum: 4294967295,
        description: 'The size of the photo as an integer',
      }),
    }),
  ]),
  endereco: Type.Union([
    Type.Null(),
    Type.Object({
      id: Type.Integer({
        minimum: 0,
        maximum: 4294967295,
        description: 'The unique identifier of the address as an integer',
      }),
      internacional: Type.Boolean({
        description: 'The flag that indicates if the address is international',
      }),
      cep: Type.String({
        description: 'The postal code of the address',
      }),
      logradouro: Type.String({
        description: 'The street of the address',
      }),
      numero: Type.String({
        description: 'The number of the address',
      }),
      complemento: Type.Union([
        Type.Null(),
        Type.String({
          description: 'The complement of the address',
        }),
      ]),
      bairro: Type.String({
        description: 'The neighborhood of the address',
      }),
      cidade: Type.String({
        description: 'The city of the address',
      }),
      estado: Type.String({
        description: 'The state of the address',
      }),
      pais: Type.String({
        description: 'The country of the address',
      }),
    }),
  ]),
});

export type IMultiCentralV1Dto = Static<typeof multiCentralV1Schema>;

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
