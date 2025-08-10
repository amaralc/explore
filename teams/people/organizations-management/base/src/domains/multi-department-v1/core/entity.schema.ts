import { JSONSchema } from 'json-schema-to-typescript';

const multiDepartmentV1Schema = {
  $schema: 'http://json-schema.org/draft-07/schema#',
  title: 'IMultiDepartmentV1Dto',
  type: 'object',
  properties: {
    id: {
      type: 'integer',
      minimum: 0,
      maximum: 4294967295,
      description: 'The unique identifier of the department as an integer',
    },
    instituicao_id: {
      type: 'integer',
      minimum: 0,
      maximum: 4294967295,
      description: 'The unique identifier of the institution that the department belongs to as an integer',
    },
    unidade_id: {
      type: 'integer',
      minimum: 0,
      maximum: 4294967295,
      description: 'The unique identifier of the unit that the department belongs to as an integer',
    },
    nome: {
      type: 'string',
      description: 'The name of the department',
    },
  },
  required: ['id', 'instituicao_id', 'unidade_id', 'nome'],
  additionalProperties: false,
} as const satisfies JSONSchema;

export default multiDepartmentV1Schema;
