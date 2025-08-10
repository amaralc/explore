import urlQueryParamsPaginationV1DtoSchema from '@peerlab/kernel/shared-ts-utils/pagination-dto.schema';

const getTaxonomicUnitsV1UrlQueryParamsJsonSchema = {
  $schema: 'http://json-schema.org/draft-07/schema#',
  title: 'IGetTaxonomicUnitsV1UrlQueryParams',
  type: 'object',
  properties: {
    ...urlQueryParamsPaginationV1DtoSchema.properties,
  },
  required: [],
};

export default getTaxonomicUnitsV1UrlQueryParamsJsonSchema;
