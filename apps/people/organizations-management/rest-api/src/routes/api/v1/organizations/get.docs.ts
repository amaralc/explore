import { agentV1JsonSchema } from '@peerlab/people/organizations-management/base/domains/agents-v1/core/entity';
import { organizationV1JsonSchema } from '@peerlab/people/organizations-management/base/domains/organizations-v1/core/entity';
import { Type } from '@sinclair/typebox';
import { OperationObject } from 'openapi3-ts/oas30';

const filteredOrganizationsSchema = Type.Array(organizationV1JsonSchema, {
  description: 'Filtered organizations v1',
});

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
