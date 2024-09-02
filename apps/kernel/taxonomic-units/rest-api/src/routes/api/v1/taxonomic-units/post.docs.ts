import taxonomicUnitV1JsonSchema from '@peerlab/kernel/taxonomic-units/base/domains/taxonomic-unit-v1/core/entity.schema';
import createFirstVersionOfTaxonomicUnitV1JsonSchema from '@peerlab/kernel/taxonomic-units/base/domains/taxonomic-unit-v1/core/use-cases/create-first-version/input-dto.schema';
import { OperationObject } from 'openapi3-ts/oas30';

export const postTaxonomicUnitsV1Schema: OperationObject = {
  tags: ['/v1/taxonomic-units'],
  requestBody: {
    content: {
      'application/json': {
        schema: createFirstVersionOfTaxonomicUnitV1JsonSchema,
      },
    },
  },
  responses: {
    200: {
      description: 'Taxonomic Unit Created',
      content: {
        'application/json': {
          schema: taxonomicUnitV1JsonSchema,
        },
      },
    },
  },
};
