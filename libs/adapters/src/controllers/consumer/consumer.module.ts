import { HandleUserCreatedService } from '@core/domains/peers/handlers/handle-user-created.service';
import { HandlePlanSubscriptionCreatedService } from '@core/domains/plan-subscriptions/handlers/handle-plan-subscription-created.service';
import { ApplicationLogger } from '@core/shared/logs/application-logger';
import { NativeLogger } from '@core/shared/logs/native-logger';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { configDto } from '../../config.dto';
import { DatabaseRepositoriesModule } from '../../database/repositories.module';
import { PlanSubscriptionsCreatedController } from './plan-subscriptions-created.controller';
import { UserCreatedController } from './user-created.controller';

@Module({
  imports: [
    /**
     * Use config module to expose environment variables
     * @see https://docs.nestjs.com/techniques/configuration
     *
     */
    ConfigModule.forRoot(),
    DatabaseRepositoriesModule.register({
      provider: configDto.databaseProvider,
    }),
  ],
  controllers: [PlanSubscriptionsCreatedController, UserCreatedController],
  providers: [
    {
      provide: ApplicationLogger,
      useClass: NativeLogger,
    },
    HandlePlanSubscriptionCreatedService,
    HandleUserCreatedService,
  ],
})
export class ConsumerModule {}
