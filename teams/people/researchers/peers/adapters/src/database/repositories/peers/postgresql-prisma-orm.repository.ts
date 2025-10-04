import { ConflictException, Injectable } from '@nestjs/common';
import { PEERS_ERROR_MESSAGES } from '@peerlab/researchers/peers/core/domains/peers/constants/error-messages';
import { PeerEntity } from '@peerlab/researchers/peers/core/domains/peers/entities/peer/entity';
import { PeersDatabaseRepository } from '@peerlab/researchers/peers/core/domains/peers/repositories/database.repository';
import { CreatePeerDto } from '@peerlab/researchers/peers/core/domains/peers/services/create-peer.dto';
import { ListPaginatedPeersDto } from '@peerlab/researchers/peers/core/domains/peers/services/list-paginated-peers.dto';
import { pagination } from '@peerlab/researchers/peers/core/shared/config';
import { configDto } from '../../../config.dto';
import { PostgreSqlPrismaOrmService } from '../../infra/prisma/postgresql-prisma-orm.service';

@Injectable()
export class PostgreSqlPrismaOrmPeersDatabaseRepository implements PeersDatabaseRepository {
  constructor(private postgreSqlPrismaOrmService: PostgreSqlPrismaOrmService) {}

  async findByUsername(username: string): Promise<PeerEntity | null> {
    const prismaEntity = await this.postgreSqlPrismaOrmService.peers.findFirst({
      where: {
        username,
      },
    });
    if (!prismaEntity) {
      return null;
    }

    const applicationEntity = new PeerEntity({
      id: prismaEntity.id,
      name: prismaEntity.name,
      username: prismaEntity.username,
      subjects: [],
    });

    return applicationEntity;
  }

  async create(createPeerDto: CreatePeerDto): Promise<PeerEntity> {
    const { username } = createPeerDto;
    const entityExists = await this.findByUsername(username);
    if (entityExists) {
      throw new ConflictException(PEERS_ERROR_MESSAGES['CONFLICTING_USERNAME']);
    }

    const prismaEntity = await this.postgreSqlPrismaOrmService.peers.create({
      data: { ...createPeerDto },
    });
    const applicationEntity = new PeerEntity({ ...prismaEntity });
    return applicationEntity;
  }

  async listPaginated(listPaginatedPlanSubscriptionsDto: ListPaginatedPeersDto) {
    const { limit, page } = listPaginatedPlanSubscriptionsDto;
    const localLimit = limit || pagination.defaultLimit;
    const localOffset = page ? page - 1 : pagination.defaultPage - 1;

    const prismaEntities = await this.postgreSqlPrismaOrmService.peers.findMany({
      skip: localOffset,
      take: localLimit,
    });
    const applicationEntities = prismaEntities.map((entity) => new PeerEntity({ ...entity }));
    return applicationEntities;
  }

  async deleteAll(): Promise<void> {
    if (configDto.applicationNodeEnv === 'development') {
      await this.postgreSqlPrismaOrmService.peers.deleteMany();
    }
  }
}
