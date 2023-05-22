import { Injectable } from '@nestjs/common';
import { PEERS_TOPICS } from '@peerlab/researchers/peers/core/domains/peers/constants/topics';
import { PeerEntity } from '@peerlab/researchers/peers/core/domains/peers/entities/peer/entity';
import { PeersEventsRepository } from '@peerlab/researchers/peers/core/domains/peers/repositories/events.repository';
import { KafkaEventsService } from '../../infra/kafka-events.service';

@Injectable()
export class KafkaPeersEventsRepository implements PeersEventsRepository {
  constructor(private kafkaEventsService: KafkaEventsService) {}

  async publishPeerCreated(entity: PeerEntity): Promise<void> {
    this.kafkaEventsService.publish({
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
