import { JSONSchema } from 'json-schema-to-typescript';

const taxonomicUnitInstanceV1JsonSchema = {
  $schema: 'http://json-schema.org/draft-07/schema#',
  title: 'ITaxonomicUnitInstanceV1',
  type: 'object',
  properties: {
    id: {
      type: 'string',
      pattern: '^[0-9a-fA-F]{24}$',
      description: 'The unique identifier of a taxonomic unit as a hexadecimal string of 24 characters.',
    },
    schema: {
      type: 'object',
      properties: {
        version: { type: 'integer', minimum: 1 },
        name: { type: 'string', pattern: '^(?:[a-z0-9]+(?:-[a-z0-9]+)*){4,}$' },
      },
      additionalProperties: false,
      required: ['name', 'version'],
    },
    data: {
      $ref: 'http://json-schema.org/draft-07/schema#',
    },
  },
  required: ['data', 'schema', 'id'],
  additionalProperties: false,
} as const satisfies JSONSchema; // TODO: if we use v7 here the type generator will not work currently

export default taxonomicUnitInstanceV1JsonSchema;
