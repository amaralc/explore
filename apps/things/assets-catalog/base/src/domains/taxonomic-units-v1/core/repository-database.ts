import { CreateManyResponseDto } from '@peerlab/kernel/shared-ts-utils/create-many-response-dto';
import { IPaginatedEntities } from '@peerlab/kernel/shared-ts-utils/paginated-entities';
import { PaginationDto } from '@peerlab/kernel/shared-ts-utils/pagination-dto';
import { ITaxonomicUnitV1Dto, TaxonomicUnitV1Entity } from './entity';

export abstract class TaxonomicUnitsV1DatabaseRepository {
  abstract generateUniqueId(): string;
  abstract create(inputDto: TaxonomicUnitV1Entity): Promise<ITaxonomicUnitV1Dto>;
  abstract createMany(taxonomicUnits: Array<ITaxonomicUnitV1Dto>): Promise<CreateManyResponseDto>;
  abstract listPaginated(paginationDto: PaginationDto): Promise<IPaginatedEntities<ITaxonomicUnitV1Dto>>;
  abstract findBySlug(nickname: string): Promise<ITaxonomicUnitV1Dto | null>;
  abstract findById(id: string): Promise<ITaxonomicUnitV1Dto | null>;
  abstract generateIndexes(): Promise<void>;
}
