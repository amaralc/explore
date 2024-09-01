import { JSONSchema } from 'json-schema-to-typescript';
import taxonomicUnitV1JsonSchema from '../../../../taxonomic-unit-v1/core/entity.schema';

const createTaxonomicUnitV1InstanceJsonSchema = {
  $schema: 'http://json-schema.org/draft-07/schema#',
  title: 'ICreateTaxonomicUnitV1InstanceInputDto',
  type: 'object',
  properties: {
    schema: {
      type: 'object',
      properties: {
        name: taxonomicUnitV1JsonSchema.properties.name,
        version: taxonomicUnitV1JsonSchema.properties.version,
      },
      required: ['name', 'version'],
      additionalProperties: false,
    },
    data: {
      type: 'object',
    },
  },
  required: ['schema', 'data'],
  additionalProperties: false,
} as const satisfies JSONSchema;

export default createTaxonomicUnitV1InstanceJsonSchema;
