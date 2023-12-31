import { DynamicModule, Module, Provider } from '@nestjs/common';
import { InMemoryPeersEventsRepository } from '@peerlab/researchers/peers/core/domains/peers/repositories/events-in-memory.repository';
import { PeersEventsRepository } from '@peerlab/researchers/peers/core/domains/peers/repositories/events.repository';
import { IEventsProvider } from '@peerlab/researchers/peers/core/shared/infra/events.types';
import { NativeLogger } from '@peerlab/researchers/peers/core/shared/logs/native-logger';
import { KafkaEventsService } from '../infra/kafka-events.service';
import { KafkaPeersEventsRepository } from './peers/kafka.repository';

@Module({})
export class EventsRepositoriesModule {
  // Initialize repository
  static register({ provider }: { provider: IEventsProvider }): DynamicModule {
    const logger = new NativeLogger();
    logger.log(`Events provider: ${provider}`, { className: EventsRepositoriesModule.name });
    let dynamicProviders: Array<Provider> = [];

    if (provider === 'kafka') {
      dynamicProviders = [KafkaEventsService, { provide: PeersEventsRepository, useClass: KafkaPeersEventsRepository }];
    }

    if (provider === 'in-memory') {
      dynamicProviders = [{ provide: PeersEventsRepository, useClass: InMemoryPeersEventsRepository }];
    }

    return {
      module: EventsRepositoriesModule,
      providers: [...dynamicProviders],
      exports: [...dynamicProviders],
    };
  }
}
