import { default as assetV1JsonSchema } from '@peerlab/things/assets-catalog/base/domains/assets-v1/core/entity.schema';
import { default as createAssetV1InputDtoSchema } from '@peerlab/things/assets-catalog/base/domains/assets-v1/core/use-cases/create-asset/input-dto.schema';
import { OperationObject } from 'openapi3-ts/oas30';

export const postAssetV1Schema: OperationObject = {
  tags: ['/v1/assets'],
  requestBody: {
    content: {
      'application/json': {
        schema: createAssetV1InputDtoSchema,
      },
    },
  },
  responses: {
    200: {
      description: 'TaxonomicUnitV1 created',
      content: {
        'application/json': {
          schema: assetV1JsonSchema,
        },
      },
    },
  },
};
