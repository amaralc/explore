import agentV1JsonSchema from '@peerlab/kernel/taxonomic-units/base/domains/agents-v1/core/entity.schema';
import { OperationObject } from 'openapi3-ts/oas30';
import filteredOrganizationsSchema from './get.docs.schema';

export const getOrganizationsV1Schema: OperationObject = {
  tags: ['/v1/organizations'],
  parameters: [
    {
      name: 'ownerAgentId',
      in: 'query',
      required: false,
      schema: {
        type: agentV1JsonSchema.properties.id.type,
        pattern: agentV1JsonSchema.properties.id.pattern,
        minLength: agentV1JsonSchema.properties.id.minLength,
        maxLength: agentV1JsonSchema.properties.id.maxLength,
      },
    },
    {
      name: 'limit',
      in: 'query',
      required: false,
      schema: {
        type: 'number',
        maximum: 100,
      },
    },
    {
      name: 'page',
      in: 'query',
      required: false,
      schema: {
        type: 'number',
      },
    },
  ],
  responses: {
    200: {
      description: 'Get filtered organizations',
      content: {
        'application/json': {
          schema: filteredOrganizationsSchema,
        },
      },
    },
  },
};
