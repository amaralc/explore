import { organizationV1JsonSchema } from '@peerlab/people/organizations-management/base/domains/organizations-v1/core/entity';
import { OperationObject } from 'openapi3-ts/oas30';

export const getV1OrganizationIdSchema: OperationObject = {
  tags: ['/v1/organizations'],
  responses: {
    200: {
      description: 'Success',
      content: {
        'application/json': {
          schema: organizationV1JsonSchema,
        },
      },
    },
  },
};
