export interface IPaginationV1Dto {
  page: number;
  limit: number;
}

export const defaultPaginationV1Dto: IPaginationV1Dto = {
  page: 1,
  limit: 10,
};
