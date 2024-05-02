import { CreateManyResponseDto } from '@peerlab/kernel/shared-ts-utils/create-many-response-dto';
import { nativeLogger } from '@peerlab/kernel/shared-ts-utils/logs/native-logger';
import { IPaginatedEntities } from '@peerlab/kernel/shared-ts-utils/paginated-entities';
import { PaginationDto } from '@peerlab/kernel/shared-ts-utils/pagination-dto';
import { randomBytes } from 'crypto';
import { IAssetV1Dto } from './entity';
import { AssetsV1DatabaseRepository } from './repository-database';

export class InMemoryAssetsV1DatabaseRepository implements AssetsV1DatabaseRepository {
  private inMemoryObjects: Array<IAssetV1Dto> = [];

  generateUniqueId() {
    return randomBytes(12).toString('hex');
  }

  async create(inputDto: IAssetV1Dto): Promise<IAssetV1Dto> {
    if (this.inMemoryObjects.some((organization) => organization.id === inputDto.id)) {
      throw new Error('Asset with the same id already exists');
    }

    this.inMemoryObjects.push(inputDto);
    return inputDto;
  }

  async createMany(inputDtoList: Array<IAssetV1Dto>): Promise<CreateManyResponseDto> {
    const uniqueEntities = [...new Set(inputDtoList)];
    if (uniqueEntities.length !== inputDtoList.length) {
      throw new Error('Agents must be unique'); // TODO: fix this rule that is more strict than the one applied in the "create" method
    }

    const inputDtoIds = inputDtoList.map((singleInputDto) => singleInputDto.id);

    for (const inputDto of inputDtoList) {
      this.create(inputDto);
    }

    return {
      ids: inputDtoIds,
      count: inputDtoList.length,
    };
  }

  async listPaginated(paginationDto: PaginationDto): Promise<IPaginatedEntities<IAssetV1Dto>> {
    const totalAssets = this.inMemoryObjects.length;
    const MINIMUM_PAGE_NUMBER = 1;
    const totalPages = Math.ceil(totalAssets / paginationDto.limit) || MINIMUM_PAGE_NUMBER; // Starts from page 1

    const start = (paginationDto.page - 1) * paginationDto.limit;
    const end = paginationDto.page * paginationDto.limit;

    const paginatedAssets = this.inMemoryObjects.slice(start, end);

    return {
      total: totalAssets,
      totalPages: totalPages,
      currentPage: paginationDto.page,
      entities: paginatedAssets,
    };
  }

  async findById(id: string): Promise<IAssetV1Dto | null> {
    const organization = this.inMemoryObjects.find((organization) => organization.id === id);
    return organization || null;
  }

  async generateIndexes() {
    nativeLogger.info('No indexes to generate when using in-memory repository');
  }
}
