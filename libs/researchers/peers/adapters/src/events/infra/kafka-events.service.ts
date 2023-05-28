import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ITopicSubscribers } from '@peerlab/researchers/peers/core/shared/infra/events.types';
import { Kafka, logLevel, Partitioners, ProducerRecord } from 'kafkajs';
import { configDto } from '../../config.dto';

@Injectable()
export class KafkaEventsService implements OnModuleInit {
  private eventsManager: Kafka;

  constructor() {
    // Create client
    this.eventsManager = new Kafka({
      clientId: configDto.kafkaClientId,
      brokers: [configDto.kafkaBroker], // replace 'kafka:9092' with your kafka host and port
      logLevel: logLevel.NOTHING,
    });
  }

  async onModuleInit() {
    // Connect with kafka
    Logger.log('Connecting with kafka...', KafkaEventsService.name);
  }

  async publish(payload: ProducerRecord) {
    Logger.log('Creating kafka producer...', KafkaEventsService.name);
    const producer = this.eventsManager.producer({ createPartitioner: Partitioners.DefaultPartitioner });
    await producer.connect();

    Logger.log('Publishing message: ' + JSON.stringify(payload), KafkaEventsService.name);
    await producer.send(payload);
    await producer.disconnect();
  }

  async subscribeToTopics(topicSubscribers: ITopicSubscribers) {
    // Create consumer
    const consumer = this.eventsManager.consumer({
      groupId: configDto.kafkaGroupId,
    });

    // Connect consumer
    await consumer.connect();

    // Subscribe to topics
    const addSubcriberTopics = async () => {
      const promises = Object.entries(topicSubscribers).map(async (item) => {
        const [topic] = item;
        return consumer.subscribe({ topic, fromBeginning: true });
      });
      return Promise.all(promises);
    };

    await addSubcriberTopics();

    await consumer.run({
      eachMessage: async ({ topic, partition, message }) => {
        await topicSubscribers[topic]({ topic, partition, message });
      },
    });
  }
}
