import { organizationV1JsonSchema } from '@peerlab/people/organizations-management/base/domains/organizations-v1/core/entity';
import { createOrgaNizationV1InputDtoSchema } from '@peerlab/people/organizations-management/base/domains/organizations-v1/core/use-cases/create-organization';
import { OperationObject } from 'openapi3-ts/oas30';

export const postOrganizationV1Schema: OperationObject = {
  tags: ['/v1/organizations'],
  requestBody: {
    content: {
      'application/json': {
        schema: createOrgaNizationV1InputDtoSchema,
      },
    },
  },
  responses: {
    200: {
      description: 'Organization created',
      content: {
        'application/json': {
          schema: organizationV1JsonSchema,
        },
      },
    },
  },
};
