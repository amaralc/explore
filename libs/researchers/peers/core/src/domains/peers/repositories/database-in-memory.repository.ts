import { ConflictException, Injectable, Logger } from '@nestjs/common';
import { pagination } from '../../../shared/config';
import { PEERS_ERROR_MESSAGES } from '../constants/error-messages';
import { PeerEntity } from '../entities/peer/entity';
import { CreatePeerDto } from '../services/create-peer.dto';
import { ListPaginatedPeersDto } from '../services/list-paginated-peers.dto';
import { PeersDatabaseRepository } from './database.repository';

const className = 'InMemoryPeersDatabaseRepository';

@Injectable()
export class InMemoryPeersDatabaseRepository implements PeersDatabaseRepository {
  private peers: PeerEntity[] = [];

  async create(createPeerDto: CreatePeerDto) {
    const { username } = createPeerDto;
    const isExistingUser = await this.findByUsername(username);
    if (isExistingUser) {
      throw new ConflictException(PEERS_ERROR_MESSAGES['CONFLICTING_USERNAME']);
    }
    const user = new PeerEntity(createPeerDto);
    this.peers.push(user);
    Logger.log('PeerEntity stored: ' + JSON.stringify(user), className);
    return user;
  }

  async findByUsername(username: string): Promise<PeerEntity | null> {
    return this.peers.find((peer) => peer.username === username) || null;
  }

  async listPaginated(listPaginatedPeersDto: ListPaginatedPeersDto) {
    const { limit, page } = listPaginatedPeersDto;
    const localLimit = limit || pagination.defaultLimit;
    const localOffset = page ? page - 1 : pagination.defaultPage - 1;

    const inMemoryPeers = [...this.peers].slice(localOffset, localLimit);
    const peerEntities = inMemoryPeers.map((inMemoryPeer) => new PeerEntity({ ...inMemoryPeer }));
    return peerEntities;
  }

  async deleteAll(): Promise<void> {
    this.peers = [];
  }
}
