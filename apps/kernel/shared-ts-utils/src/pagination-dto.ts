import { Static, Type } from '@sinclair/typebox';

export interface IPaginationV1Dto {
  page: number;
  limit: number;
}

export const defaultPaginationV1Dto: IPaginationV1Dto = {
  page: 1,
  limit: 10,
};

export const urlQueryParamsPaginationV1DtoSchema = Type.Object({
  page: Type.Optional(
    Type.String({
      // Number from 1 to 4294967295
      pattern:
        '^(?:[1-9]|[1-9][0-9]{1,8}|[1-3][0-9]{9}|4[0-1][0-9]{8}|42[0-8][0-9]{7}|429[0-3][0-9]{6}|4294[0-8][0-9]{5}|42949[0-6][0-9]{4}|429496[0-6][0-9]{3}|4294967[0-1][0-9]{2}|42949672[0-8][0-9]{1}|429496729[0-5])$',
      description:
        'The page number. It must be an integer greater than or equal to 1 and less than or equal to 4294967295.',
      examples: ['1', '10', '100'],
    }),
  ),
  limit: Type.Optional(
    Type.String({
      // Number from 1 to 100
      pattern: '^(?:[1-9]|[1-9][0-9]|100)$',
      description: 'The number of items per page. It must be greater than or equal to 1 and less than or equal to 100.',
      examples: ['10', '50', '100'],
    }),
  ),
});

export type IUrlQueryParamsPaginationV1Dto = Static<typeof urlQueryParamsPaginationV1DtoSchema>;
