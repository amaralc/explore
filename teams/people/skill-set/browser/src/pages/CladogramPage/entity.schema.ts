import { JSONSchema } from 'json-schema-to-typescript';

const nodeSchema = {
  $schema: 'http://json-schema.org/draft-07/schema#',
  title: 'ICladogramNode',
  type: 'object',
  properties: {
    name: {
      type: 'string',
      description: 'The name of the node.',
    },
    length: {
      type: 'number',
      description: 'The length property of the node.',
    },
    stars: {
      type: 'number',
      description: 'A number between 1 and 5 representing the level expertise in the topic.',
      minimum: 0,
      maximum: 5,
    },
    description: {
      type: ['string', 'null'],
      description: 'A detailed description of what is included in this skill.',
    },
    branchset: {
      type: 'array',
      items: { $ref: '#' },
      description: 'Array of child nodes.',
    },
  },
  required: ['name', 'length', 'branchset'],
  additionalProperties: false,
} as const satisfies JSONSchema;

export default nodeSchema;
