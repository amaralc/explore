export interface ICreateManyResponseDto {
  ids: string[];
  count: number;
}

export interface IUpsertManyResponseDto {
  insertedIds: string[];
  insertedCount: number;
  upsertedIds: string[];
  upsertedCount: number;
}
