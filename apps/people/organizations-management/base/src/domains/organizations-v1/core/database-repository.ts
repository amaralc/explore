import { IPaginatedEntities } from '@peerlab/kernel/shared-ts-utils/paginated-entities';
import { PaginationDto } from '@peerlab/kernel/shared-ts-utils/pagination-dto';
import { IOrganizationV1Dto, OrganizationV1Entity } from './entity';

export abstract class OrganizationsV1DatabaseRepository {
  abstract generateUniqueId(): string;
  abstract create(inputDto: IOrganizationV1Dto): Promise<IOrganizationV1Dto>;
  abstract listPaginated(paginationDto: PaginationDto): Promise<IPaginatedEntities<OrganizationV1Entity>>;
  abstract findByNickname(nickname: string): Promise<OrganizationV1Entity | null>;
  abstract findById(id: string): Promise<OrganizationV1Entity | null>;
  abstract getOrganizationsByOwnerId(id: string): Promise<Array<OrganizationV1Entity>>;
  abstract findByEmail(email: string): Promise<OrganizationV1Entity | null>;
  abstract generateIndexes(): Promise<void>;
}
