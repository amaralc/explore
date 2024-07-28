import { CreateManyResponseDto } from '@peerlab/kernel/shared-ts-utils/create-many-response-dto';
import { IPaginatedEntities } from '@peerlab/kernel/shared-ts-utils/paginated-entities';
import { IPaginationV1Dto } from '@peerlab/kernel/shared-ts-utils/pagination-dto';
import { IAssetV1Dto } from './entity';

export abstract class AssetsV1DatabaseRepository {
  abstract generateUniqueId(): string;
  abstract create(inputDto: IAssetV1Dto): Promise<IAssetV1Dto>;
  abstract createMany(taxonomicUnits: Array<IAssetV1Dto>): Promise<CreateManyResponseDto>;
  abstract listPaginated(paginationDto: IPaginationV1Dto): Promise<IPaginatedEntities<IAssetV1Dto>>;
  abstract findById(id: string): Promise<IAssetV1Dto | null>;
  abstract generateIndexes(): Promise<void>;
}
