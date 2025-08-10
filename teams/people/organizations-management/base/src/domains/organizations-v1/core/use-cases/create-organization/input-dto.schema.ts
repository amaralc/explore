import { JSONSchema } from 'json-schema-to-typescript';
import organizationV1JsonSchema from '../../entity.schema';

const schema = {
  $schema: 'http://json-schema.org/draft-07/schema#',
  title: 'ICreateOrganizationV1InputDtoSchema',
  type: 'object',
  properties: {
    nickname: organizationV1JsonSchema.properties.nickname,
    ownerAgentId: organizationV1JsonSchema.properties.ownerAgentId,
    email: organizationV1JsonSchema.properties.email,
    planSubscriptionName: organizationV1JsonSchema.properties.planSubscriptionName,
  },
  required: ['nickname', 'ownerAgentId', 'email', 'planSubscriptionName'],
  additionalProperties: false,
} as const satisfies JSONSchema;

export default schema;
