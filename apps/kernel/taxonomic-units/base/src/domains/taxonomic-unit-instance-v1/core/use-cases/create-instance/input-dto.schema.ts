import { JSONSchema } from 'json-schema-to-typescript';
import taxonomicUnitInstanceV1JsonSchema from '../../entity.schema';

const createTaxonomicUnitV1InstanceJsonSchema = {
  $schema: 'http://json-schema.org/draft-07/schema#',
  title: 'ICreateTaxonomicUnitV1InstanceInputDto',
  type: 'object',
  properties: {
    schema: taxonomicUnitInstanceV1JsonSchema.properties.schema,
    data: taxonomicUnitInstanceV1JsonSchema.properties.data,
  },
  required: ['schema', 'data'],
  additionalProperties: false,
} as const satisfies JSONSchema;

export default createTaxonomicUnitV1InstanceJsonSchema;
