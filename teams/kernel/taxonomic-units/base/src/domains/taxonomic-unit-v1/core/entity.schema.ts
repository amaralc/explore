import { JSONSchema7 } from 'json-schema';

const taxonomicUnitV1JsonSchema = {
  $schema: 'http://json-schema.org/draft-07/schema#',
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
    lineageIdPath: {
      type: 'string',
      description:
        'The taxonomic lineage of a taxon (taxonomic unit) from the root to the taxon itself, as represented by a path of ids in the hierarchy',
      pattern: '^/([0-9a-fA-F]{24})(?:/([0-9a-fA-F]{24}))*$',
    },
    metadata: {
      anyOf: [{ type: 'null' }, { type: 'object' }, { type: 'array' }, { type: 'string' }, { type: 'number' }, { type: 'boolean' }, { type: 'integer' }],
    },
    metadataSchema: { $ref: 'http://json-schema.org/draft-07/schema#' },
    instanceSchema: { $ref: 'http://json-schema.org/draft-07/schema#' }, // First you should add the $ref as a key to ajv meta schema
  },
  required: ['name', 'instanceSchema', 'metadataSchema', 'metadata', 'version', 'id', 'lineageIdPath'],
  additionalProperties: false,
} as const satisfies JSONSchema7;

export default taxonomicUnitV1JsonSchema;
