import { IPaginatedEntities, IPaginatedEntitiesV2 } from '@peerlab/kernel/shared-ts-utils/paginated-entities';
import { IPaginationV1Dto, defaultPaginationV1Dto } from '@peerlab/kernel/shared-ts-utils/pagination-dto';
import { randomBytes } from 'crypto';
import {
  DuplicatedOrganizationIdsError,
  DuplicatedOrganizationNicknamesError,
} from '../../_shared/core/use-cases/extract-entities-from-external-source/errors';
import { ICreateManyResponseDto, IUpsertManyResponseDto } from '../../_shared/types';
import { OrganizationsV1DatabaseRepository } from './database-repository';
import { IFilterOrganizationV1InputDto } from './database-repository.types';
import { IOrganizationV1Dto } from './entity.schema.types';

export class InMemoryOrganizationsV1Repository implements OrganizationsV1DatabaseRepository {
  constructor(private organizations: Array<IOrganizationV1Dto> = []) {}

  generateIndexes(): Promise<void> {
    throw new Error('Method not implemented in InMemoryOrganizationsV1Repository');
  }

  generateUniqueId() {
    return randomBytes(12).toString('hex');
  }

  async create(organizationV1Entity: IOrganizationV1Dto): Promise<IOrganizationV1Dto> {
    if (this.organizations.some((organization) => organization.id === organizationV1Entity.id)) {
      throw new Error('Organization with the same id already exists');
    }

    this.organizations.push(organizationV1Entity);
    return organizationV1Entity;
  }

  async createMany(organizationsV1Dto: Array<IOrganizationV1Dto>): Promise<ICreateManyResponseDto> {
    const uniqueOrganizationIds = new Set(organizationsV1Dto.map((item) => item.id));
    if (uniqueOrganizationIds.size !== organizationsV1Dto.length) {
      throw new DuplicatedOrganizationIdsError('Duplicate IDs found in organizations data');
    }

    const uniqueOrganizationNicknames = new Set(organizationsV1Dto.map((item) => item.nickname));
    if (uniqueOrganizationNicknames.size !== organizationsV1Dto.length) {
      throw new DuplicatedOrganizationNicknamesError('Duplicate nicknames found in organizations data');
    }

    this.organizations.push(...organizationsV1Dto);

    const uniqueOrganizationIdsList = [...uniqueOrganizationIds.values()];
    return {
      count: organizationsV1Dto.length,
      ids: uniqueOrganizationIdsList,
    };
  }

  async upsertMany(organizations: Array<IOrganizationV1Dto>): Promise<IUpsertManyResponseDto> {
    const insertedIds = [];
    const upsertedIds = [];
    for (const organization of organizations) {
      const existingInstance = this.organizations.find(
        (existingOrganization) => existingOrganization.id === organization.id,
      );
      if (existingInstance) {
        this.deleteById(organization.id);
        upsertedIds.push(organization.id);
      } else {
        insertedIds.push(organization.id);
      }
      this.create(organization);
    }

    return {
      insertedIds,
      insertedCount: insertedIds.length,
      upsertedIds,
      upsertedCount: upsertedIds.length,
    };
  }

  async listPaginated(paginationDto: IPaginationV1Dto): Promise<IPaginatedEntities<IOrganizationV1Dto>> {
    const totalOrganizations = this.organizations.length;
    const MINIMUM_PAGE_NUMBER = 1;
    const totalPages = Math.ceil(totalOrganizations / paginationDto.limit) || MINIMUM_PAGE_NUMBER; // Starts from page 1

    const start = (paginationDto.page - 1) * paginationDto.limit;
    const end = paginationDto.page * paginationDto.limit;

    const paginatedOrganizations = this.organizations.slice(start, end);

    return {
      total: totalOrganizations,
      totalPages: totalPages,
      currentPage: paginationDto.page,
      entities: paginatedOrganizations,
    };
  }

  async findByNickname(nickname: string): Promise<IOrganizationV1Dto | null> {
    const organization = this.organizations.find((organization) => organization.nickname === nickname);
    return organization || null;
  }

  async findById(id: string): Promise<IOrganizationV1Dto | null> {
    const organization = this.organizations.find((organization) => organization.id === id);
    return organization || null;
  }

  async findByEmail(email: string): Promise<Array<IOrganizationV1Dto>> {
    const organization = this.organizations.filter((organization) => organization.email === email);
    return organization;
  }

  async findByAgentId(agentId: string): Promise<IOrganizationV1Dto | null> {
    const organization = this.organizations.find((organization) => organization.agentId === agentId);
    return organization || null;
  }

  async getOrganizationsByOwnerId(id: string): Promise<Array<IOrganizationV1Dto>> {
    const organizations = this.organizations.filter((organization) => organization.ownerAgentId === id);
    return organizations;
  }

  async deleteById(id: string): Promise<void> {
    this.organizations = this.organizations.filter((organization) => organization.id !== id);
  }

  public async countAll(): Promise<number> {
    return this.organizations.length;
  }

  public async filterPaginated({
    pagination = defaultPaginationV1Dto,
    query = {},
  }: IFilterOrganizationV1InputDto): Promise<IPaginatedEntitiesV2<IOrganizationV1Dto>> {
    const filteredOrganizationsV1 = this.organizations.filter((organization) => {
      return Object.entries(query).every(([key, value]) => organization[key] === value);
    });

    const totalFilteredOrganizations = filteredOrganizationsV1.length;
    const MINIMUM_PAGE_NUMBER = 1;
    const totalPages = Math.ceil(totalFilteredOrganizations / pagination.limit) || MINIMUM_PAGE_NUMBER; // Starts from page 1

    const start = (pagination.page - 1) * pagination.limit;
    const end = pagination.page * pagination.limit;

    const paginatedOrganizations = filteredOrganizationsV1.slice(start, end);

    return {
      nextPage: pagination.page + 1 > totalPages ? null : pagination.page + 1,
      page: pagination.page,
      pageSize: pagination.limit,
      entities: paginatedOrganizations,
    };
  }
}
