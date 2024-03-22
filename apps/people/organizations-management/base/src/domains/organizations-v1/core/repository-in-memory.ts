import { randomBytes } from 'crypto';
import { IPaginatedEntities } from '../../../utils/paginated-entities';
import { PaginationDto } from '../../../utils/pagination-dto';
import { OrganizationV1Entity } from './entity';
import { OrganizationsV1Repository } from './repository';

export class InMemoryOrganizationsV1Repository implements OrganizationsV1Repository {
  private organizations: Array<OrganizationV1Entity> = [];

  generateUniqueId() {
    return randomBytes(12).toString('hex');
  }

  async create(organizationV1Entity: OrganizationV1Entity): Promise<OrganizationV1Entity> {
    if (this.organizations.some((organization) => organization.id === organizationV1Entity.id)) {
      throw new Error('Organization with the same id already exists');
    }
    this.organizations.push(organizationV1Entity);
    return organizationV1Entity;
  }

  async listPaginated(paginationDto: PaginationDto): Promise<IPaginatedEntities<OrganizationV1Entity>> {
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

  async findByNickname(nickname: string): Promise<OrganizationV1Entity | null> {
    const organization = this.organizations.find((organization) => organization.nickname === nickname);
    return organization || null;
  }

  async findById(id: string): Promise<OrganizationV1Entity | null> {
    const organization = this.organizations.find((organization) => organization.id === id);
    return organization || null;
  }

  async findByEmail(email: string): Promise<OrganizationV1Entity | null> {
    const organization = this.organizations.find((organization) => organization.email === email);
    return organization || null;
  }

  async getOrganizationsByOwnerId(id: string): Promise<Array<OrganizationV1Entity>> {
    const organizations = this.organizations.filter((organization) => organization.ownerAgentId === id);
    return organizations;
  }
}
