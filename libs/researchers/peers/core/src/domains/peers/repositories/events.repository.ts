import { PeerEntity } from '../entities/peer/entity';

// Abstraction
export abstract class PeersEventsRepository {
  abstract publishPeerCreated(userEntity: PeerEntity): Promise<void>;
}
