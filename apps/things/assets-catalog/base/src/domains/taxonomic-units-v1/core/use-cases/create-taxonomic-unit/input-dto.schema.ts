import { JSONSchema } from 'json-schema-to-typescript';
import taxonomicUnitV1JsonSchema from '../../entity.schema';

const createTaxonomicUnitV1InputDtoSchema = {
  $schema: 'http://json-schema.org/draft-07/schema#',
  title: 'ICreateTaxonomicUnitV1InputDto',
  type: 'object',
  properties: {
    slug: taxonomicUnitV1JsonSchema.properties.slug,
  },
  required: ['slug'],
  additionalProperties: false,
} as const satisfies JSONSchema;

export default createTaxonomicUnitV1InputDtoSchema;
