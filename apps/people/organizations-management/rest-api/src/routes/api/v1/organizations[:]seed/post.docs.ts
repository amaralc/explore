import { OperationObject } from 'openapi3-ts/oas30';
import { seedOrganizationsFromExternalSourceInputDtoSchema } from './post.types';

export const seedOrganizationV1Schema: OperationObject = {
  tags: ['/v1/organizations'],
  requestBody: {
    content: {
      'application/json': {
        schema: seedOrganizationsFromExternalSourceInputDtoSchema,
      },
    },
  },
  responses: {
    201: {
      description: 'Organizations created',
    },
  },
};
