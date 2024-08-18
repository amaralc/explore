import { JSONSchema } from 'json-schema-to-typescript';

const taxonomicUnitV1Schema = {
  $schema: 'http://json-schema.org/draft-04/schema#',
  title: 'ITaxonomicUnitV1',
  type: 'object',
  properties: {
    version: { type: 'integer', minimum: 1 },
    name: { type: 'string', pattern: '^(?:[a-z0-9]+(?:-[a-z0-9]+)*){4,}$' },
    schema: { $ref: 'http://json-schema.org/draft-04/schema' }, // First you should add the $ref as a key to ajv meta schema
  },
  required: ['name', 'schema', 'version'],
  additionalProperties: false,
} as const satisfies JSONSchema;

export default taxonomicUnitV1Schema;
