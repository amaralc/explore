import { JSONSchema } from 'json-schema-to-typescript';
import entityDtoSchema from '../../entity.schema';

const createFirstVersionOfTaxonomicUnitV1JsonSchema = {
  $schema: 'http://json-schema.org/draft-07/schema#',
  title: 'ICreateFirstVersionOfTaxonomicUnitV1InputDto',
  type: 'object',
  properties: {
    name: entityDtoSchema.properties.name,
    schema: entityDtoSchema.properties.schema,
    parentId: {
      anyOf: [
        {
          type: 'string',
          pattern: '^[0-9a-fA-F]{24}$',
        },
        { type: 'null' },
      ],
      description:
        'The unique identifier of the parent taxonomic unit, as a hexadecimal string of 24 characters. If the value is null, the taxon is the root of a taxonomic hierarchy',
    },
  },
  required: ['name', 'schema', 'parentId'],
  additionalProperties: false,
} as const satisfies JSONSchema;

export default createFirstVersionOfTaxonomicUnitV1JsonSchema;
