import { JSONSchema } from 'json-schema-to-typescript';

const agentV1DtoJsonSchema = {
  $schema: 'http://json-schema.org/draft-07/schema#',
  title: 'IAgentV1Dto',
  type: 'object',
  properties: {
    id: {
      type: 'string',
      minLength: 28,
      maxLength: 28,
      pattern: '^[A-Za-z0-9]{28}$',
      description: 'The unique identifier of an agent as a hexadecimal string of 28 characters.',
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
        'The email of the agent. An organization agent can have the same e-mail of its owner only if its owner is an individual agent. Two individual agents cannot have the same e-mail.',
    },
    type: {
      type: 'string',
      enum: ['INDIVIDUAL', 'ORGANIZATION'],
      description: 'The type of the agent. It can be individual or organization.',
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
  required: ['id', 'nickname', 'email', 'type', 'createdAt', 'updatedAt'],
  additionalProperties: false,
} as const satisfies JSONSchema;

export default agentV1DtoJsonSchema;
