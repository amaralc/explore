import { IKafkaMessage } from '../infra/events.types';

export class EventDto {
  topic!: string;
  partition!: number;
  message!: IKafkaMessage;
}
