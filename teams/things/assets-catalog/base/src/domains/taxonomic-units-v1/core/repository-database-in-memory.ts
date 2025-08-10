import { CreateManyResponseDto } from '@peerlab/kernel/shared-ts-utils/create-many-response-dto';
import { winstonLogger } from '@peerlab/kernel/shared-ts-utils/logs/winston-logger';
import { IPaginatedEntities } from '@peerlab/kernel/shared-ts-utils/paginated-entities';
import { IPaginationV1Dto } from '@peerlab/kernel/shared-ts-utils/pagination-dto';
import { randomBytes } from 'crypto';
import { ITaxonomicUnitV1Dto, TaxonomicUnitV1Entity } from './entity';
import { TaxonomicUnitsV1DatabaseRepository } from './repository-database';

export class InMemoryTaxonomicUnitsV1DatabaseRepository implements TaxonomicUnitsV1DatabaseRepository {
  private organizations: Array<ITaxonomicUnitV1Dto> = [];

  generateUniqueId() {
    return randomBytes(12).toString('hex');
  }

  deleteAll(): Promise<void> {
    throw Error('Method not implemented');
  }

  async create(organizationV1Entity: TaxonomicUnitV1Entity): Promise<ITaxonomicUnitV1Dto> {
    if (this.organizations.some((organization) => organization.id === organizationV1Entity.id)) {
      throw new Error('Organization with the same id already exists');
    }
    this.organizations.push(organizationV1Entity);
    return organizationV1Entity;
  }

  async createMany(entities: Array<TaxonomicUnitV1Entity>): Promise<CreateManyResponseDto> {
    const uniqueEntities = [...new Set(entities)];
    if (uniqueEntities.length !== entities.length) {
      throw new Error('Agents must be unique'); // TODO: fix this rule that is more strict than the one applied in the "create" method
    }

    const agentIds = entities.map((singleEntity) => singleEntity.id);

    for (const entity of entities) {
      this.create(entity);
    }

    return {
      ids: agentIds,
      count: entities.length,
    };
  }

  async listPaginated(paginationDto: IPaginationV1Dto): Promise<IPaginatedEntities<ITaxonomicUnitV1Dto>> {
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

  async findBySlug(slug: string): Promise<ITaxonomicUnitV1Dto | null> {
    const organization = this.organizations.find((organization) => organization.slug === slug);
    return organization || null;
  }

  async findById(id: string): Promise<ITaxonomicUnitV1Dto | null> {
    const organization = this.organizations.find((organization) => organization.id === id);
    return organization || null;
  }

  async generateIndexes() {
    winstonLogger.info('No indexes to generate when using in-memory repository');
  }
}
