import { Injectable } from '@nestjs/common';
import { PEERS_TOPICS } from '../constants/topics';
import { PeerEntity } from '../entities/peer/entity';
import { PeersEventsRepository } from './events.repository';

interface ISimplifiedProducerRecord {
  topic: string;
  messages: Array<{ key: string; value: string }>;
}

@Injectable()
export class InMemoryPeersEventsRepository implements PeersEventsRepository {
  private userCreatedTopicMessages: Array<ISimplifiedProducerRecord> = [];

  async publishPeerCreated(entity: PeerEntity): Promise<void> {
    this.userCreatedTopicMessages.push({
      topic: PEERS_TOPICS['PEER_CREATED'],
      messages: [
        {
          key: entity.username,
          value: JSON.stringify({ ...entity }),
        },
      ],
    });
  }
}
