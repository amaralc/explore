import taxonomicUnitV1JsonSchema from '@peerlab/kernel/taxonomic-units/base/domains/taxonomic-unit-v1/core/entity.schema';
import { JSONSchema } from 'json-schema-to-typescript';

const filteredTaxonomicUnitV1ListJsonSchema = {
  $schema: 'http://json-schema.org/draft-07/schema#',
  title: 'IFilteredTaxonomicUnitV1List',
  type: 'array',
  description: 'Filtered Taxonomic Units V1',
  items: taxonomicUnitV1JsonSchema,
} as const satisfies JSONSchema;

export default filteredTaxonomicUnitV1ListJsonSchema;
