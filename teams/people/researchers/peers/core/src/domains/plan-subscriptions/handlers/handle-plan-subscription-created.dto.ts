import { IKafkaMessage } from '../../../shared/infra/events.types';

export class HandlePlanSubscriptionCreatedDto {
  topic!: string;
  partition!: number;
  message!: IKafkaMessage;
}
