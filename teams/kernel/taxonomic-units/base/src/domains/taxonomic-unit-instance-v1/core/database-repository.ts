import { ICreateManyResponseDto, IUpsertManyResponseDto } from '../../_shared/types';

export abstract class TaxonomicUnitInstancesV1DatabaseRepository {
  abstract generateUniqueId(): string;
  abstract generateIndexes(): Promise<void>;
  abstract create(inputDto: unknown): Promise<unknown>;
  abstract findManyByName(name: string): Promise<Array<unknown>>;
  abstract findManyByNameAndVersion(name: string, version: number): Promise<unknown | null>;
  abstract findById(id: string): Promise<unknown | null>;
  abstract createMany(inputDto: Array<unknown>): Promise<ICreateManyResponseDto>;
  abstract upsertMany(inputDto: Array<unknown>): Promise<IUpsertManyResponseDto>;
  abstract countAll(): Promise<number>;
  abstract deleteById(id: string): Promise<void>;
}
