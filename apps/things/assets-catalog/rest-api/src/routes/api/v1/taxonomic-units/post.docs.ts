import { taxonomicUnitV1JsonSchema } from '@peerlab/things/assets-catalog/base/domains/taxonomic-units-v1/core/entity';
import { createTaxonomicUnitV1InputDtoSchema } from '@peerlab/things/assets-catalog/base/domains/taxonomic-units-v1/core/use-cases/create-taxonomic-unit';
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
