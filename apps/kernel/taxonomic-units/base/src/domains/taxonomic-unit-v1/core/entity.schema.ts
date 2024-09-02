import { JSONSchema } from 'json-schema-to-typescript';

const taxonomicUnitV1JsonSchema = {
  $schema: 'http://json-schema.org/draft-04/schema#',
  title: 'ITaxonomicUnitV1',
  type: 'object',
  properties: {
    id: {
      type: 'string',
      pattern: '^[0-9a-fA-F]{24}$',
      description: 'The unique identifier of a taxonomic unit as a hexadecimal string of 24 characters.',
    },
    version: { type: 'integer', minimum: 1 },
    name: { type: 'string', pattern: '^(?:[a-z0-9]+(?:-[a-z0-9]+)*){4,}$' },
    schema: { $ref: 'http://json-schema.org/draft-04/schema#' }, // First you should add the $ref as a key to ajv meta schema
  },
  required: ['name', 'schema', 'version', 'id'],
  additionalProperties: false,
} as const satisfies JSONSchema; // TODO: if we use v7 here the type generator will not work currently

export default taxonomicUnitV1JsonSchema;
