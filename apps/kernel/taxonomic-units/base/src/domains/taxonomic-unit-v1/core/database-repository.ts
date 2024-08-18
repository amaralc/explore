import { IPaginatedEntities, IPaginatedEntitiesV2 } from '@peerlab/kernel/shared-ts-utils/paginated-entities';
import { IPaginationV1Dto } from '@peerlab/kernel/shared-ts-utils/pagination-dto';
import { ICreateManyResponseDto, IUpsertManyResponseDto } from '../../_shared/types';
import { IFilterOrganizationV1InputDto } from './database-repository.types';
import { IOrganizationV1Dto } from './entity.schema.types';

export abstract class OrganizationsV1DatabaseRepository {
  abstract generateUniqueId(): string;
  abstract create(inputDto: IOrganizationV1Dto): Promise<IOrganizationV1Dto>;
  abstract listPaginated(paginationDto: IPaginationV1Dto): Promise<IPaginatedEntities<IOrganizationV1Dto>>;
  abstract findByAgentId(agentId: string): Promise<IOrganizationV1Dto | null>;
  abstract findByNickname(nickname: string): Promise<IOrganizationV1Dto | null>;
  abstract findById(id: string): Promise<IOrganizationV1Dto | null>;
  abstract filterPaginated(inputDto: IFilterOrganizationV1InputDto): Promise<IPaginatedEntitiesV2<IOrganizationV1Dto>>;
  abstract getOrganizationsByOwnerId(id: string): Promise<Array<IOrganizationV1Dto>>;
  abstract findByEmail(email: string): Promise<Array<IOrganizationV1Dto>>;
  abstract generateIndexes(): Promise<void>;
  abstract createMany(inputDto: Array<IOrganizationV1Dto>): Promise<ICreateManyResponseDto>;
  abstract upsertMany(inputDto: Array<IOrganizationV1Dto>): Promise<IUpsertManyResponseDto>;
  abstract countAll(): Promise<number>;
  abstract deleteById(id: string): Promise<void>;
}
