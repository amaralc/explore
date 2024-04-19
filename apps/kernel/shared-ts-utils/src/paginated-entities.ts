export type IPaginatedEntities<T> = {
  total: number;
  totalPages: number;
  currentPage: number;
  entities: Array<T>;
};
