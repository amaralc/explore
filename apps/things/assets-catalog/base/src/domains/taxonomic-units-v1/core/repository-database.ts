import { CreateManyResponseDto } from '@peerlab/kernel/shared-ts-utils/create-many-response-dto';
import { IPaginatedEntities } from '@peerlab/kernel/shared-ts-utils/paginated-entities';
import { IPaginationV1Dto } from '@peerlab/kernel/shared-ts-utils/pagination-dto';
import { ITaxonomicUnitV1Dto } from './entity.schema.types';

export abstract class TaxonomicUnitsV1DatabaseRepository {
  abstract generateUniqueId(): string;
  abstract create(inputDto: ITaxonomicUnitV1Dto): Promise<ITaxonomicUnitV1Dto>;
  abstract createMany(taxonomicUnits: Array<ITaxonomicUnitV1Dto>): Promise<CreateManyResponseDto>;
  abstract listPaginated(paginationDto: IPaginationV1Dto): Promise<IPaginatedEntities<ITaxonomicUnitV1Dto>>;
  abstract findBySlug(nickname: string): Promise<ITaxonomicUnitV1Dto | null>;
  abstract findById(id: string): Promise<ITaxonomicUnitV1Dto | null>;
  abstract generateIndexes(): Promise<void>;
  abstract deleteAll(): Promise<void>;
}
