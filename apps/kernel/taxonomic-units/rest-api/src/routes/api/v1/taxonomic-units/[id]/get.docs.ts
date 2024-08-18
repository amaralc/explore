import taxonomicUnitV1JsonSchema from '@peerlab/kernel/taxonomic-units/base/domains/taxonomic-unit-v1/core/entity.schema';
import { OperationObject } from 'openapi3-ts/oas30';

export const getV1OrganizationIdSchema: OperationObject = {
  tags: ['/v1/taxonomic-units'],
  responses: {
    200: {
      description: 'Success',
      content: {
        'application/json': {
          schema: taxonomicUnitV1JsonSchema,
        },
      },
    },
  },
};
