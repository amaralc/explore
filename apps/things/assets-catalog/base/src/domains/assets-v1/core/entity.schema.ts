import { JSONSchema } from 'json-schema-to-typescript';

const assetV1JsonSchema = {
  $schema: 'http://json-schema.org/draft-07/schema#',
  title: 'IAssetV1Dto',
  type: 'object',
  properties: {
    id: {
      type: 'string',
      minLength: 24,
      maxLength: 24,
      pattern: '^[0-9a-fA-F]{24}$',
      description: 'The unique identifier of an agent as a hexadecimal string of 24 characters.',
    },
    name: {
      type: 'string',
      minLength: 1,
      description: 'The name of the asset. It must have at least 1 character.',
    },
    taxonomicUnitSlug: {
      type: 'string',
      minLength: 4,
      pattern: '^(?:[a-z0-9]+(?:-[a-z0-9]+)*){4,}$',
      description:
        'The slug of the taxonomic unit the asset belongs to as a direct child. It must have at least 4 characters.',
    },
    tags: {
      type: 'array',
      description: 'An array of strings that help to describe the asset',
      items: {
        type: 'string',
        minLength: 1,
        pattern: '^(?:[a-z0-9]+(?:-[a-z0-9]+)*){4,}$',
        description: 'The tags of the asset. Each tag must have at least 4 characters.',
      },
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
  required: ['id', 'name', 'taxonomicUnitSlug', 'tags', 'createdAt', 'updatedAt'],
  additionalProperties: false,
} as const satisfies JSONSchema;

export default assetV1JsonSchema;
