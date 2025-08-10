import urlQueryParamsPaginationV1DtoSchema from '@peerlab/kernel/shared-ts-utils/pagination-dto.schema';
import agentV1DtoJsonSchema from '@peerlab/people/organizations-management/base/domains/agents-v1/core/entity.schema';

const getOrganizationsV1UrlQueryParamsJsonSchema = {
  $schema: 'http://json-schema.org/draft-07/schema#',
  title: 'IGetOrganizationsV1UrlQueryParams',
  type: 'object',
  properties: {
    ...urlQueryParamsPaginationV1DtoSchema.properties,
    ownerAgentId: agentV1DtoJsonSchema.properties.id,
  },
  required: [],
};

export default getOrganizationsV1UrlQueryParamsJsonSchema;
