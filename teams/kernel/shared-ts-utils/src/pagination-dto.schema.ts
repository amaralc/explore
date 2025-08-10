import { JSONSchema } from 'json-schema-to-typescript';

const urlQueryParamsPaginationV1DtoSchema = {
  $schema: 'http://json-schema.org/draft-07/schema#',
  title: 'IUrlQueryParamsPaginationV1Dto',
  type: 'object',
  properties: {
    page: {
      type: 'string',
      pattern:
        '^(?:[1-9]|[1-9][0-9]{1,8}|[1-3][0-9]{9}|4[0-1][0-9]{8}|42[0-8][0-9]{7}|429[0-3][0-9]{6}|4294[0-8][0-9]{5}|42949[0-6][0-9]{4}|429496[0-6][0-9]{3}|4294967[0-1][0-9]{2}|42949672[0-8][0-9]{1}|429496729[0-5])$',
      description:
        'The page number. It must be an integer greater than or equal to 1 and less than or equal to 4294967295.',
      examples: ['1', '10', '100'],
    },
    limit: {
      type: 'string',
      pattern: '^(?:[1-9]|[1-9][0-9]|100)$',
      description: 'The number of items per page. It must be greater than or equal to 1 and less than or equal to 100.',
      examples: ['10', '50', '100'],
    },
  },
  additionalProperties: false,
} as const satisfies JSONSchema;

export default urlQueryParamsPaginationV1DtoSchema;
