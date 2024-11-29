import { default as createTaxonomicUnitV1InputDtoSchema, default as taxonomicUnitV1JsonSchema } from '@peerlab/kernel/taxonomic-units/base/domains/taxonomic-unit-v1/core/entity.schema';
import { OperationObject } from 'openapi3-ts/oas30';

export const postTaxonomicUnitV1Schema: OperationObject = {
  tags: ['/v1/taxonomic-units'],
  requestBody: {
    content: {
      'application/json': {
        schema: createTaxonomicUnitV1InputDtoSchema,
      },
    },
  },
  responses: {
    200: {
      description: 'TaxonomicUnitV1 created',
      content: {
        'application/json': {
          schema: taxonomicUnitV1JsonSchema,
        },
      },
    },
  },
};
