export type IPaginatedEntities<T> = {
  total: number;
  totalPages: number;
  currentPage: number;
  entities: Array<T>;
};

export type IPaginatedEntitiesV2<T> = {
  page: number;
  pageSize: number;
  nextPage: number | null;
  entities: Array<T>;
};
