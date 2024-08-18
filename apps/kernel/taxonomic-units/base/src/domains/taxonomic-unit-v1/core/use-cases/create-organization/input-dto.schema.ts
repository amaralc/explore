import { JSONSchema } from 'json-schema-to-typescript';
import organizationV1JsonSchema from '../../entity.schema';

const schema = {
  $schema: 'http://json-schema.org/draft-07/schema#',
  title: 'ICreateOrganizationV1InputDtoSchema',
  type: 'object',
  properties: {
    nickname: organizationV1JsonSchema.properties.name,
    ownerAgentId: organizationV1JsonSchema.properties.version,
  },
  required: ['name', 'version'],
  additionalProperties: false,
} as const satisfies JSONSchema;

export default schema;
