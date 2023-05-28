import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CreatePeerService } from '@peerlab/researchers/peers/core/domains/peers/services/create-peer.service';
import { DeleteAllPeersService } from '@peerlab/researchers/peers/core/domains/peers/services/delete-all-peers.service';
import { ListPaginatedPeersService } from '@peerlab/researchers/peers/core/domains/peers/services/list-paginated-peers.service';
import { CreatePlanSubscriptionService } from '@peerlab/researchers/peers/core/domains/plan-subscriptions/services/create-plan-subscription.service';
import { ListPaginatedPlanSubscriptionsService } from '@peerlab/researchers/peers/core/domains/plan-subscriptions/services/list-paginated-plan-subscriptions.service';
import { ApplicationLogger } from '@peerlab/researchers/peers/core/shared/logs/application-logger';
import { NativeLogger } from '@peerlab/researchers/peers/core/shared/logs/native-logger';
import { configDto } from '../../config.dto';
import { DatabaseRepositoriesModule } from '../../database/repositories.module';
import { EventsRepositoriesModule } from '../../events/repositories/repositories.module';
import { LoggingMiddleware } from '../../logs/logging.middleware';
import { PeersRestController } from './routes/peers/controller';
import { PlanSubscriptionsRestController } from './routes/plan-subscriptions/controller';

@Module({
  imports: [
    /**
     * Use config module to expose environment variables
     * @see https://docs.nestjs.com/techniques/configuration
     */
    ConfigModule.forRoot(),
    // /**
    //  * Use devtools module to expose devtools
    //  * @see https://docs.nestjs.com/devtools/overview
    //  */
    // DevtoolsModule.register({
    //   http: process.env['NODE_ENV'] !== 'production',
    //   port: 8000,
    // }),
    DatabaseRepositoriesModule.register({
      provider: configDto.databaseProvider,
    }),
    EventsRepositoriesModule.register({
      provider: configDto.eventsProvider,
    }),
  ],
  controllers: [PlanSubscriptionsRestController, PeersRestController],
  providers: [
    {
      provide: ApplicationLogger,
      useClass: NativeLogger,
    },
    CreatePeerService,
    ListPaginatedPeersService,
    DeleteAllPeersService,
    CreatePlanSubscriptionService,
    ListPaginatedPlanSubscriptionsService,
  ],
})
export class ApiModule implements NestModule {
  /**
   * Use logging middleware
   * @see https://learn.nestjs.com/courses/591712/lectures/23246768
   */
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggingMiddleware).forRoutes('*'); // Apply middleware to all routes https://docs.nestjs.com/middleware
  }
}
