import { IPaginatedEntitiesV2 } from '@peerlab/kernel/shared-ts-utils/paginated-entities';
import { defaultPaginationV1Dto } from '@peerlab/kernel/shared-ts-utils/pagination-dto';
import { randomBytes } from 'crypto';
import { ICreateManyResponseDto, IUpsertManyResponseDto } from '../../_shared/types';
import { TaxonomicUnitsV1DatabaseRepository } from '../core/database-repository';
import { IFilterTaxonomicUnitsV1InputDto } from '../core/database-repository.types';
import { ITaxonomicUnitV1 } from '../core/entity.schema.types';
import {
  DuplicatedTaxonomicUnitIdError,
  TaxonomicUnitV1NotFoundError,
  UniqueTaxonomicUnitV1NameAndVersionError,
} from '../core/errors';

export class InMemoryTaxonomicUnitsV1Repository implements TaxonomicUnitsV1DatabaseRepository {
  constructor(private entityDtoList: Array<ITaxonomicUnitV1> = []) {}

  generateIndexes(): Promise<void> {
    throw new Error('Method not implemented');
  }

  generateUniqueId() {
    return randomBytes(12).toString('hex');
  }

  async create(inputDto: ITaxonomicUnitV1): Promise<ITaxonomicUnitV1> {
    if (this.entityDtoList.some((entityDto) => entityDto.id === inputDto.id)) {
      throw new Error('Taxonomic Unit with the same id already exists');
    }

    this.entityDtoList.push(inputDto);
    return inputDto;
  }

  async createMany(inputDto: Array<ITaxonomicUnitV1>): Promise<ICreateManyResponseDto> {
    const uniqueEntityDtoIds = new Set(inputDto.map((item) => item.id));
    if (uniqueEntityDtoIds.size !== inputDto.length) {
      throw new DuplicatedTaxonomicUnitIdError('ID is already taken');
    }

    const uniqueEntityDtoNameAndVersionSet = new Set(inputDto.map((item) => `${item.name}-${item.version}`));
    if (uniqueEntityDtoNameAndVersionSet.size !== inputDto.length) {
      throw new UniqueTaxonomicUnitV1NameAndVersionError('Two taxonomic units with the same name and version found');
    }

    this.entityDtoList.push(...inputDto);

    const uniqueEntityDtoIdsList = [...uniqueEntityDtoIds.values()];
    return {
      count: inputDto.length,
      ids: uniqueEntityDtoIdsList,
    };
  }

  async upsertMany(entityDtoArray: Array<ITaxonomicUnitV1>): Promise<IUpsertManyResponseDto> {
    const insertedIds = [];
    const upsertedIds = [];
    for (const entityDto of entityDtoArray) {
      const existingInstance = this.entityDtoList.find((item) => item.id === entityDto.id);
      if (existingInstance) {
        this.deleteById(entityDto.id);
        upsertedIds.push(entityDto.id);
      } else {
        insertedIds.push(entityDto.id);
      }
      this.create(entityDto);
    }

    return {
      insertedIds,
      insertedCount: insertedIds.length,
      upsertedIds,
      upsertedCount: upsertedIds.length,
    };
  }

  async findById(id: string): Promise<ITaxonomicUnitV1 | null> {
    const entityDto = this.entityDtoList.find((entityDto) => entityDto.id === id);
    return entityDto || null;
  }

  async findManyByName(name: string): Promise<Array<ITaxonomicUnitV1>> {
    const entityDtoList = this.entityDtoList.filter((entityDto) => entityDto.name === name);
    return entityDtoList;
  }

  async findOneByNameAndVersion(name: string, version: number): Promise<ITaxonomicUnitV1> {
    const entityDto = this.entityDtoList.find((entityDto) => entityDto.name === name && entityDto.version === version);
    if (!entityDto) {
      throw new TaxonomicUnitV1NotFoundError(`Taxonomic Unit with name ${name} and version ${version} not found`);
    }
    return entityDto;
  }

  async deleteById(id: string): Promise<void> {
    this.entityDtoList = this.entityDtoList.filter((entityDto) => entityDto.id !== id);
  }

  public async countAll(): Promise<number> {
    return this.entityDtoList.length;
  }

  public async filterPaginated({
    pagination = defaultPaginationV1Dto,
    query = {},
  }: IFilterTaxonomicUnitsV1InputDto): Promise<IPaginatedEntitiesV2<ITaxonomicUnitV1>> {
    const filteredEntityDtoList = this.entityDtoList.filter((entityDto) => {
      return Object.entries(query).every(([key, value]) => entityDto[key] === value);
    });

    const totalFilteredEntityDtoInstances = filteredEntityDtoList.length;
    const MINIMUM_PAGE_NUMBER = 1;
    const totalPages = Math.ceil(totalFilteredEntityDtoInstances / pagination.limit) || MINIMUM_PAGE_NUMBER; // Starts from page 1

    const start = (pagination.page - 1) * pagination.limit;
    const end = pagination.page * pagination.limit;

    const paginatedEntityDtoInstances = filteredEntityDtoList.slice(start, end);

    return {
      nextPage: pagination.page + 1 > totalPages ? null : pagination.page + 1,
      page: pagination.page,
      pageSize: pagination.limit,
      entities: paginatedEntityDtoInstances,
    };
  }
}
