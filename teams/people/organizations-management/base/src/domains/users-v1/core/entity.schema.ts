import { JSONSchema } from 'json-schema-to-typescript';

const userV1JsonSchema = {
  $schema: 'http://json-schema.org/draft-07/schema#',
  title: 'IUserV1Dto',
  type: 'object',
  properties: {
    id: {
      type: 'string',
      minLength: 28,
      maxLength: 28,
      pattern: '^[A-Za-z0-9]{28}$',
      description: 'The unique identifier for a user, expected to be 28 characters long.',
    },
    email: {
      type: 'string',
      format: 'email',
      description: 'The email address of the user.',
    },
    emailVerified: {
      type: 'boolean',
      description: "Flag indicating whether the user's email address has been verified.",
    },
    displayName: {
      type: 'string',
      description: 'The display name of the user.',
    },
    photoURL: {
      type: ['string', 'null'],
      format: 'uri',
      description: "The URL of the user's photo.",
    },
    disabled: {
      type: 'boolean',
      description: 'Flag indicating whether the user account is disabled.',
    },
    createdAt: {
      type: 'string',
      format: 'date-time',
      description: 'The creation date and time of the user account.',
      pattern: '^[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}:[0-9]{2}.[0-9]{3}Z$',
    },
    updatedAt: {
      type: 'string',
      format: 'date-time',
      description: 'The last update date and time of the user account.',
      pattern: '^[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}:[0-9]{2}.[0-9]{3}Z$',
    },
  },
  required: ['id', 'email', 'emailVerified', 'displayName', 'disabled', 'createdAt', 'updatedAt'],
  additionalProperties: false,
} as const satisfies JSONSchema;

export default userV1JsonSchema;
