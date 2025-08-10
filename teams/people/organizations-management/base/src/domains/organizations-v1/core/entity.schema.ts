import { JSONSchema } from 'json-schema-to-typescript';
import agentV1JsonSchema from '../../agents-v1/core/entity.schema';

const organizationV1JsonSchema = {
  $schema: 'http://json-schema.org/draft-07/schema#',
  title: 'IOrganizationV1Dto',
  type: 'object',
  properties: {
    id: {
      type: 'string',
      minLength: 24,
      maxLength: 24,
      pattern: '^[0-9a-fA-F]{24}$',
      description: 'The unique identifier of an agent as a hexadecimal string of 24 characters.',
    },
    nickname: {
      type: 'string',
      minLength: 4,
      pattern: '^(?:[a-z0-9]+(?:-[a-z0-9]+)*){4,}$',
      description: 'The nickname of the agent. It must have at least 4 characters.',
    },
    email: {
      type: 'string',
      format: 'email',
      description:
        'The email of the organization. An organization agent can have the same e-mail of its owner only if its owner is an individual agent. Two organizations cannot have the same e-mail.',
    },
    agentId: agentV1JsonSchema.properties.id,
    ownerAgentId: {
      ...agentV1JsonSchema.properties.id,
      description:
        'The unique identifier of the agent that owns the organization, as a hexadecimal string of 28 characters.',
    },
    planSubscriptionName: {
      type: 'string',
      enum: ['FREE'],
      description: 'The type of the agent. It can be individual or organization.',
    },
    idPath: {
      type: 'string',
      description: 'The path of the organization in the hierarchy.',
      pattern: '^/([0-9a-fA-F]{24})(?:/([0-9a-fA-F]{24}))*$',
    },
    createdAt: {
      type: 'string',
      format: 'date-time',
      description: 'The date and time when the agent was created.',
      pattern: '^[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}:[0-9]{2}.[0-9]{3}Z$',
    },
    updatedAt: {
      type: 'string',
      format: 'date-time',
      description: 'The date and time when the agent was last updated.',
      pattern: '^[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}:[0-9]{2}.[0-9]{3}Z$',
    },
  },
  required: [
    'id',
    'nickname',
    'email',
    'agentId',
    'ownerAgentId',
    'planSubscriptionName',
    'idPath',
    'createdAt',
    'updatedAt',
  ],
  additionalProperties: false,
} as const satisfies JSONSchema;

export default organizationV1JsonSchema;
