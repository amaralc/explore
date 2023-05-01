import { PlanSubscriptionCreatedMessageDto } from '@core/domains/plan-subscriptions/entities/plan-subscription-created-message/dto';
import { HandlePlanSubscriptionCreatedService } from '@core/domains/plan-subscriptions/handlers/handle-plan-subscription-created.service';
import { Controller } from '@nestjs/common';
import { Ctx, EventPattern, KafkaContext, Payload } from '@nestjs/microservices';

/**
 * @see https://stackoverflow.com/questions/74403746/infinite-retries-when-using-rpcfilter-in-nestjs-microservice-setup-with-kafka
 * @see https://docs.nestjs.com/microservices/kafka#retriable-exceptions
 */

@Controller()
export class PlanSubscriptionsCreatedController {
  constructor(private readonly handlePlanSubscriptionCreatedService: HandlePlanSubscriptionCreatedService) {}

  @EventPattern('plan-subscription-created')
  async handlePlanSubscriptionCreated(
    @Payload() data: PlanSubscriptionCreatedMessageDto,
    @Ctx() context: KafkaContext
  ) {
    await this.handlePlanSubscriptionCreatedService.execute({
      topic: context.getTopic(),
      partition: context.getPartition(),
      message: context.getMessage(),
    });
  }
}
