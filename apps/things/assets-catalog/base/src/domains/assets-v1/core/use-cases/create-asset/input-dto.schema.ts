import { JSONSchema } from 'json-schema-to-typescript';
import assetV1JsonSchema from '../../entity.schema';

const createAssetV1InputDtoSchema = {
  $schema: 'http://json-schema.org/draft-07/schema#',
  title: 'ICreateAssetV1InputDto',
  type: 'object',
  properties: {
    name: assetV1JsonSchema.properties.name,
    taxonomicUnitSlug: assetV1JsonSchema.properties.taxonomicUnitSlug,
    tags: assetV1JsonSchema.properties.tags,
  },
  required: ['name', 'taxonomicUnitSlug', 'tags'],
  additionalProperties: false,
} as const satisfies JSONSchema;

export default createAssetV1InputDtoSchema;
