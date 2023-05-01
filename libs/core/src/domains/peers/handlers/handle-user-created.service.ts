import { Injectable } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { EventDto } from '../../../shared/dto/event.dto';
import { ApplicationLogger } from '../../../shared/logs/application-logger';
import { EventErrorLog } from '../../../shared/logs/event-error-log';
import { parseOrRejectMessage } from '../../../shared/validators/parse-or-reject-message';
import { applicationValidateOrReject } from '../../../shared/validators/validate-or-reject';
import { UserCreatedMessageValueDto } from '../entities/user-created-message-value/dto';
import { PeersDatabaseRepository } from '../repositories/database.repository';

@Injectable()
export class HandleUserCreatedService {
  constructor(
    private readonly peersDatabaseRepository: PeersDatabaseRepository,
    private readonly logger: ApplicationLogger
  ) {}

  async execute({ topic, partition, message }: EventDto): Promise<void> {
    try {
      // Validate
      const parsedMessage = parseOrRejectMessage(message.value);
      const messageValueDto = plainToInstance(UserCreatedMessageValueDto, parsedMessage);
      await applicationValidateOrReject(messageValueDto);

      // Execute
      const peer = await this.peersDatabaseRepository.create({
        id: messageValueDto.user.id,
        name: messageValueDto.user.name,
        username: messageValueDto.user.username,
      });
      console.log(peer);

      // Log
      this.logger.info('Plan subscription created', { ...messageValueDto });
    } catch (error) {
      new EventErrorLog(this.logger, error, { topic, partition, message });
    }
  }
}
