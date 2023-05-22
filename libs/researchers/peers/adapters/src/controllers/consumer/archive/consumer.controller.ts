import { Controller, OnModuleInit } from '@nestjs/common';
import { HandlePlanSubscriptionCreatedService } from '@peerlab/researchers/peers/core/domains/plan-subscriptions/handlers/handle-plan-subscription-created.service';
import { ITopicSubscribers } from '@peerlab/researchers/peers/core/shared/infra/events.types';
import { configDto } from '../../../config.dto';

@Controller()
export class ConsumerController implements OnModuleInit {
  constructor(private readonly handlePlanSubscriptionCreated: HandlePlanSubscriptionCreatedService) {}

  async onModuleInit() {
    if (configDto.eventsProvider !== 'kafka') return;

    const { kafkaTopicPlanSubscriptionCreated } = configDto;

    const consumerGroupOptions = {
      clientId: configDto.kafkaClientId,
      groupId: configDto.kafkaGroupId,
      kafkaHost: configDto.kafkaBroker,
    };

    const topicSubscribers: ITopicSubscribers = {
      [kafkaTopicPlanSubscriptionCreated]: async ({ topic, partition, message }) =>
        await this.handlePlanSubscriptionCreated.execute({ topic, partition, message }),
    };

    // const uselessCallback = async () => {}; // TODO: remove callback from kafka-event-manager consumerGroup props
    // await consumerGroup(topicSubscribers, consumerGroupOptions, uselessCallback, configDto.kafkaUseSasl);
  }
}
