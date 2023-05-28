import { Controller } from '@nestjs/common';
import { Ctx, EventPattern, KafkaContext, Payload } from '@nestjs/microservices';
import { UserCreatedMessageValueDto } from '@peerlab/researchers/peers/core/domains/peers/entities/user-created-message-value/dto';
import { HandleUserCreatedService } from '@peerlab/researchers/peers/core/domains/peers/handlers/handle-user-created.service';

/**
 * @see https://stackoverflow.com/questions/74403746/infinite-retries-when-using-rpcfilter-in-nestjs-microservice-setup-with-kafka
 * @see https://docs.nestjs.com/microservices/kafka#retriable-exceptions
 */

@Controller()
export class UserCreatedController {
  constructor(private readonly handleUserCreatedreatedService: HandleUserCreatedService) {}

  @EventPattern('user-created')
  async handleUserCreatedreated(@Payload() data: UserCreatedMessageValueDto, @Ctx() context: KafkaContext) {
    console.log('here');
    await this.handleUserCreatedreatedService.execute({
      topic: context.getTopic(),
      partition: context.getPartition(),
      message: context.getMessage(),
    });
  }
}
