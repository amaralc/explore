import organizationV1JsonSchema from '@peerlab/kernel/taxonomic-units/base/domains/taxonomic-unit-v1/core/entity.schema';
import { JSONSchema } from 'json-schema-to-typescript';

const filteredOrganizationsSchema = {
  $schema: 'http://json-schema.org/draft-07/schema#',
  title: 'IFilteredOrganizationsV1OutputDto',
  type: 'array',
  description: 'Filtered organizations v1',
  items: organizationV1JsonSchema,
} as const satisfies JSONSchema;

export default filteredOrganizationsSchema;
