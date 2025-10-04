import { CustomTransportStrategy, ServerKafka } from '@nestjs/microservices';
import { Consumer } from '@nestjs/microservices/external/kafka.interface';

/**
 * Custom transporters
 *
 * Docs: @see https://docs.nestjs.com/microservices/custom-transport
 * Articles:
 *  - @see https://dev.to/nestjs/integrate-nestjs-with-external-services-using-microservice-transporters-part-1-p3
 *  - @see https://dev.to/johnbiundo/series/4724
 *  - @see https://dev.to/nestjs/part-1-introduction-and-setup-1a2l
 * Implementation: @see https://github.com/nestjs/nest/issues/3083#issuecomment-1077456005
 */

export class KafkaCustomTransport extends ServerKafka implements CustomTransportStrategy {
  override async bindEvents(consumer: Consumer): Promise<void> {
    const registeredPatterns = [...this.messageHandlers.entries()].map(([pattern]) => pattern);

    const consumerSubscribeOptions = this.options?.subscribe || {};
    const subscribeToPattern = async (pattern: string) =>
      consumer.subscribe({
        topic: pattern,
        ...consumerSubscribeOptions,
      });
    await Promise.all(registeredPatterns.map(subscribeToPattern));

    const consumerRunOptions = Object.assign(this.options?.run || {}, {
      eachMessage: this.getMessageHandler(),
    });
    await consumer.run(consumerRunOptions);
  }
}
