import taxonomicUnitInstanceV1JsonSchema from '@peerlab/kernel/taxonomic-units/base/domains/taxonomic-unit-instance-v1/core/entity.schema';
import createTaxonomicUnitV1InstanceJsonSchema from '@peerlab/kernel/taxonomic-units/base/domains/taxonomic-unit-instance-v1/core/use-cases/create-instance/input-dto.schema';
import { OperationObject } from 'openapi3-ts/oas30';

export const postTaxonomicUnitsInstanceV1Schema: OperationObject = {
  tags: ['/v1/taxonomic-units'],
  requestBody: {
    content: {
      'application/json': {
        schema: createTaxonomicUnitV1InstanceJsonSchema,
      },
    },
  },
  responses: {
    200: {
      description: 'Taxonomic Unit Created',
      content: {
        'application/json': {
          schema: taxonomicUnitInstanceV1JsonSchema,
        },
      },
    },
  },
};
