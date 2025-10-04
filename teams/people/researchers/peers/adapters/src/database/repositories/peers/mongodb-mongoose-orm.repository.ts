import { ConflictException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { PEERS_ERROR_MESSAGES } from '@peerlab/researchers/peers/core/domains/peers/constants/error-messages';
import { PeerEntity } from '@peerlab/researchers/peers/core/domains/peers/entities/peer/entity';
import { PeersDatabaseRepository } from '@peerlab/researchers/peers/core/domains/peers/repositories/database.repository';
import { CreatePeerDto } from '@peerlab/researchers/peers/core/domains/peers/services/create-peer.dto';
import { ListPaginatedPeersDto } from '@peerlab/researchers/peers/core/domains/peers/services/list-paginated-peers.dto';
import { pagination } from '@peerlab/researchers/peers/core/shared/config';
import { Model } from 'mongoose';
import { configDto } from '../../../config.dto';
import { MongoosePeer } from './mongodb-mongoose-orm.entity';

@Injectable()
export class MongoDbMongooseOrmPeersDatabaseRepository implements PeersDatabaseRepository {
  constructor(
    @InjectModel(MongoosePeer.name)
    private readonly peerModel: Model<MongoosePeer>
  ) {}

  async create(createUserDto: CreatePeerDto): Promise<PeerEntity> {
    const { username } = createUserDto;
    const userExists = await this.findByUsername(username);
    if (userExists) {
      throw new ConflictException(PEERS_ERROR_MESSAGES['CONFLICTING_USERNAME']);
    }

    const mongooseEntity = await this.peerModel.create({
      id: createUserDto.id,
      name: createUserDto.name,
      username: createUserDto.username,
    });

    const applicationEntity = new PeerEntity({
      id: mongooseEntity.id,
      username: mongooseEntity.username,
      subjects: mongooseEntity.subjects,
      name: mongooseEntity.name,
    });
    return applicationEntity;
  }

  async findByUsername(username: string): Promise<PeerEntity | null> {
    const mongooseEntity = await this.peerModel.findOne({
      username,
    });

    if (!mongooseEntity) {
      return null;
    }

    const applicationEntity = new PeerEntity({
      id: mongooseEntity.id,
      username: mongooseEntity.username,
      subjects: mongooseEntity.subjects,
      name: mongooseEntity.name,
    });
    return applicationEntity;
  }

  async listPaginated(listPaginatedPeerDto: ListPaginatedPeersDto) {
    const { limit, page } = listPaginatedPeerDto;
    const localLimit = limit || pagination.defaultLimit;
    const localOffset = page ? page - 1 : pagination.defaultPage - 1;

    const mongooseEntities = await this.peerModel.find().skip(localOffset).limit(localLimit);

    const planSubscriptionEntities = mongooseEntities.map(
      (entity) =>
        new PeerEntity({
          id: entity.id,
          username: entity.username,
          subjects: entity.subjects,
          name: entity.name,
        })
    );
    return planSubscriptionEntities;
  }

  async deleteAll(): Promise<void> {
    if (configDto.applicationNodeEnv === 'development') {
      await this.peerModel.deleteMany();
    }
  }
}
