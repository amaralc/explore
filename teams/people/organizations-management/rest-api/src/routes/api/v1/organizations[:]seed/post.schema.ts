import agentV1JsonSchema from '@peerlab/people/organizations-management/base/domains/agents-v1/core/entity.schema';
import { JSONSchema } from 'json-schema-to-typescript';

const postOrganizationsV1SeedSchema = {
  $schema: 'http://json-schema.org/draft-07/schema#',
  title: 'ISeedOrganizationsFromExternalSourceInputDto',
  type: 'object',
  properties: {
    sourceName: {
      type: 'string',
      enum: ['USP_MULTI'],
      description: 'A string that identifies the source where organizations should be extracted from',
    },
    agentAccountHolderId: agentV1JsonSchema.properties.id,
  },
  required: ['sourceName', 'agentAccountHolderId'],
  additionalProperties: false,
} as const satisfies JSONSchema;

export default postOrganizationsV1SeedSchema;
