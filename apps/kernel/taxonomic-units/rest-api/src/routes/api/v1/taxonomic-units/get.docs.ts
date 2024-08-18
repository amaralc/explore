import { OperationObject } from 'openapi3-ts/oas30';
import filteredOrganizationsSchema from './get.docs.schema';

export const getTaxonomicUnitsV1Schema: OperationObject = {
  tags: ['/v1/taxonomic-units'],
  parameters: [
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
