import { JSONSchema } from 'json-schema-to-typescript';
import entityDtoSchema from '../../entity.schema';

const createFirstVersionOfTaxonomicUnitV1JsonSchema = {
  $schema: 'http://json-schema.org/draft-07/schema#',
  title: 'ICreateFirstVersionOfTaxonomicUnitV1InputDto',
  type: 'object',
  properties: {
    name: entityDtoSchema.properties.name,
    schema: entityDtoSchema.properties.schema,
  },
  required: ['name', 'schema'],
  additionalProperties: false,
} as const satisfies JSONSchema;

export default createFirstVersionOfTaxonomicUnitV1JsonSchema;
