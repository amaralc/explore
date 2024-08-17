import { JSONSchema } from 'json-schema-to-typescript';

const multiUnitV1Schema = {
  $schema: 'http://json-schema.org/draft-07/schema#',
  title: 'IMultiUnitV1Dto',
  type: 'object',
  properties: {
    id: {
      type: 'integer',
      minimum: 0,
      maximum: 4294967295,
      description: 'The unique identifier of the unit as an integer',
    },
    instituicao_id: {
      type: 'integer',
      minimum: 0,
      maximum: 4294967295,
      description: 'The unique identifier of the institution that the unit belongs to as an integer',
    },
    nome: {
      type: 'string',
      description: 'The name of the unit',
    },
    sigla: {
      type: 'string',
      description: 'The acronym of the unit',
    },
  },
  required: ['id', 'instituicao_id', 'nome', 'sigla'],
  additionalProperties: false,
} as const satisfies JSONSchema;

export default multiUnitV1Schema;
