import { JSONSchema } from 'json-schema-to-typescript';

const multiInstitutionV1Schema = {
  $schema: 'http://json-schema.org/draft-07/schema#',
  title: 'IMultiInstitutionV1Dto',
  type: 'object',
  properties: {
    id: {
      type: 'integer',
      minimum: 0,
      maximum: 4294967295,
      description: 'The unique identifier of a multi institution as an integer',
    },
    nome: {
      type: 'string',
      description: 'The name of the multi institution',
    },
    sigla: {
      type: 'string',
      description: 'The acronym of the multi institution',
    },
    documento_institucional: {
      anyOf: [
        { type: 'null' },
        {
          type: 'string',
          description: 'The document of the multi institution',
        },
      ],
    },
    link_numero_patrimonio: {
      anyOf: [
        { type: 'null' },
        {
          type: 'string',
          description: 'The link to the asset number of the multi institution',
        },
      ],
    },
  },
  required: ['id', 'nome', 'sigla'],
  additionalProperties: false,
} as const satisfies JSONSchema;

export default multiInstitutionV1Schema;
