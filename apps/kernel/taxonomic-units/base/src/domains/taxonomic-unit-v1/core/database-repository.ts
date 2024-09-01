import { IPaginatedEntitiesV2 } from '@peerlab/kernel/shared-ts-utils/paginated-entities';
import { ICreateManyResponseDto, IUpsertManyResponseDto } from '../../_shared/types';
import { IFilterTaxonomicUnitsV1InputDto } from './database-repository.types';
import { ITaxonomicUnitV1 } from './entity.schema.types';

export abstract class TaxonomicUnitsV1DatabaseRepository {
  abstract generateUniqueId(): string;
  abstract create(inputDto: ITaxonomicUnitV1): Promise<ITaxonomicUnitV1>;
  abstract findManyByName(name: string): Promise<Array<ITaxonomicUnitV1>>;
  abstract findOneByNameAndVersion(name: string, version: number): Promise<ITaxonomicUnitV1 | null>;
  abstract findById(id: string): Promise<ITaxonomicUnitV1 | null>;
  abstract filterPaginated(inputDto: IFilterTaxonomicUnitsV1InputDto): Promise<IPaginatedEntitiesV2<ITaxonomicUnitV1>>;
  abstract generateIndexes(): Promise<void>;
  abstract createMany(inputDto: Array<ITaxonomicUnitV1>): Promise<ICreateManyResponseDto>;
  abstract upsertMany(inputDto: Array<ITaxonomicUnitV1>): Promise<IUpsertManyResponseDto>;
  abstract countAll(): Promise<number>;
  abstract deleteById(id: string): Promise<void>;
}
