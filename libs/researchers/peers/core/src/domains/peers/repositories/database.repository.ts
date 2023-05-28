import { PeerEntity } from '../entities/peer/entity';
import { CreatePeerDto } from '../services/create-peer.dto';
import { ListPaginatedPeersDto } from '../services/list-paginated-peers.dto';

// Abstraction
export abstract class PeersDatabaseRepository {
  abstract create(createUserDto: CreatePeerDto): Promise<PeerEntity>;
  abstract listPaginated(listPaginatedPeersDto: ListPaginatedPeersDto): Promise<Array<PeerEntity>>;
  abstract findByUsername(username: string): Promise<PeerEntity | null>;
  abstract deleteAll(): Promise<void>;
}
