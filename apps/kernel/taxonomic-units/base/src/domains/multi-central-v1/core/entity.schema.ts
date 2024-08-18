import { JSONSchema } from 'json-schema-to-typescript';
import multiDepartmentV1Schema from '../../multi-department-v1/core/entity.schema';
import multiInstitutionV1Schema from '../../multi-institution-v1/core/entity.schema';
import multiUnitV1Schema from '../../multi-unit-v1/core/entity.schema';

const multiCentralV1Schema = {
  $schema: 'http://json-schema.org/draft-07/schema#',
  title: 'IMultiCentralV1Dto',
  type: 'object',
  properties: {
    id: {
      type: 'integer',
      minimum: 0,
      maximum: 4294967295,
      description: 'The unique identifier of a multi central as an integer',
    },
    instituicao_id: multiInstitutionV1Schema.properties.id,
    unidade_id: {
      type: 'integer',
      minimum: 0,
      maximum: 4294967295,
      description: 'The unique identifier of the unit that the multi central belongs to as an integer',
    },
    departamento_id: {
      anyOf: [
        { type: 'null' },
        {
          type: 'integer',
          minimum: 0,
          maximum: 4294967295,
          description: 'The unique identifier of the department that the multi central belongs to as an integer',
        },
      ],
    },
    nome: {
      type: 'string',
      description: 'The name of the multi central',
    },
    sigla: {
      type: 'string',
      description: 'The acronym of the multi central',
    },
    site: {
      anyOf: [{ type: 'null' }, { type: 'string', description: 'The website of the multi central' }],
    },
    email: {
      type: 'string',
      format: 'email',
      description: 'The email of the multi central',
    },
    telefone1: {
      type: 'string',
      description: 'The first phone number of the multi central',
    },
    telefone2: {
      anyOf: [{ type: 'null' }, { type: 'string', description: 'The second phone number of the multi central' }],
    },
    endereco_id: {
      anyOf: [
        { type: 'null' },
        {
          type: 'integer',
          minimum: 0,
          maximum: 4294967295,
          description: 'The unique identifier of the address that the multi central belongs to as an integer',
        },
      ],
    },
    como_chegar: {
      anyOf: [{ type: 'null' }, { type: 'string', description: 'The how to get to the multi central' }],
    },
    sobre: {
      anyOf: [{ type: 'null' }, { type: 'string', description: 'The about of the multi central' }],
    },
    horario_atendimento: {
      anyOf: [{ type: 'null' }, { type: 'string', description: 'The opening hours of the multi central' }],
    },
    observacoes: {
      anyOf: [{ type: 'null' }, { type: 'string', description: 'The observations of the multi central' }],
    },
    tesouraria: {
      type: 'boolean',
      description: 'The flag that indicates if the multi central is a treasury',
    },
    passo_atual: {
      type: 'integer',
      minimum: 0,
      maximum: 4294967295,
      description: 'The current step of the multi central as an integer',
    },
    central_status_id: {
      type: 'integer',
      minimum: 0,
      maximum: 4294967295,
      description: 'The unique identifier of the status of the multi central as an integer',
    },
    foto_arquivo_id: {
      anyOf: [
        { type: 'null' },
        {
          type: 'integer',
          minimum: 0,
          maximum: 4294967295,
          description: 'The unique identifier of the photo file of the multi central as an integer',
        },
      ],
    },
    created: {
      type: 'string',
      description: 'The creation date of the multi central',
    },
    created_by: {
      type: 'integer',
      minimum: 0,
      maximum: 4294967295,
      description: 'The unique identifier of the user that created the multi central as an integer',
    },
    updated: {
      type: 'string',
      description: 'The last update date of the multi central',
    },
    updated_by: {
      type: 'integer',
      minimum: 0,
      maximum: 4294967295,
      description: 'The unique identifier of the user that updated the multi central as an integer',
    },
    deleted: { type: 'null' },
    instituicao: multiInstitutionV1Schema,
    unidade: multiUnitV1Schema,
    departamento: {
      anyOf: [{ type: 'null' }, multiDepartmentV1Schema],
    },
    foto: {
      anyOf: [
        { type: 'null' },
        {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              minimum: 0,
              maximum: 4294967295,
              description: 'The unique identifier of the photo as an integer',
            },
            nome_original: {
              type: 'string',
              description: 'The original name of the photo',
            },
            nome_final: {
              type: 'string',
              description: 'The final name of the photo',
            },
            path: {
              type: 'string',
              description: 'The path of the photo',
            },
            encoding: {
              type: 'string',
              enum: ['7bit'],
              description: 'The encoding of the photo',
            },
            mimetype: {
              type: 'string',
              enum: ['image/jpeg', 'image/png'],
              description: 'The mimetype of the photo',
            },
            tamanho: {
              type: 'integer',
              minimum: 0,
              maximum: 4294967295,
              description: 'The size of the photo as an integer',
            },
          },
          required: ['id', 'nome_original', 'nome_final', 'path', 'encoding', 'mimetype', 'tamanho'],
        },
      ],
    },
    endereco: {
      anyOf: [
        { type: 'null' },
        {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              minimum: 0,
              maximum: 4294967295,
              description: 'The unique identifier of the address as an integer',
            },
            internacional: {
              type: 'boolean',
              description: 'The flag that indicates if the address is international',
            },
            cep: {
              type: 'string',
              description: 'The postal code of the address',
            },
            logradouro: {
              type: 'string',
              description: 'The street of the address',
            },
            numero: {
              type: 'string',
              description: 'The number of the address',
            },
            complemento: {
              anyOf: [{ type: 'null' }, { type: 'string', description: 'The complement of the address' }],
            },
            bairro: {
              type: 'string',
              description: 'The neighborhood of the address',
            },
            cidade: {
              type: 'string',
              description: 'The city of the address',
            },
            estado: {
              type: 'string',
              description: 'The state of the address',
            },
            pais: {
              type: 'string',
              description: 'The country of the address',
            },
          },
          required: ['id', 'internacional', 'cep', 'logradouro', 'numero', 'bairro', 'cidade', 'estado', 'pais'],
        },
      ],
    },
  },
  required: [
    'id',
    'instituicao_id',
    'unidade_id',
    'nome',
    'sigla',
    'email',
    'telefone1',
    'tesouraria',
    'passo_atual',
    'central_status_id',
    'created',
    'created_by',
    'updated',
    'updated_by',
  ],
  additionalProperties: false,
} as const satisfies JSONSchema;

export default multiCentralV1Schema;
