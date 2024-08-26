import { ICreateManyResponseDto, IUpsertManyResponseDto } from '../../_shared/types';
import { ITaxonomicUnitInstanceV1 } from './entity.schema.types';

export abstract class TaxonomicUnitInstancesV1DatabaseRepository {
  abstract generateUniqueId(): string;
  abstract generateIndexes(): Promise<void>;
  abstract create(inputDto: ITaxonomicUnitInstanceV1): Promise<ITaxonomicUnitInstanceV1>;
  abstract findManyByName(name: string): Promise<Array<ITaxonomicUnitInstanceV1>>;
  abstract findManyByNameAndVersion(name: string, version: number): Promise<ITaxonomicUnitInstanceV1 | null>;
  abstract findById(id: string): Promise<ITaxonomicUnitInstanceV1 | null>;
  abstract createMany(inputDto: Array<ITaxonomicUnitInstanceV1>): Promise<ICreateManyResponseDto>;
  abstract upsertMany(inputDto: Array<ITaxonomicUnitInstanceV1>): Promise<IUpsertManyResponseDto>;
  abstract countAll(): Promise<number>;
  abstract deleteById(id: string): Promise<void>;
}
