import { Injectable } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { ApplicationLogger } from '../../../shared/logs/application-logger';
import { EventErrorLog } from '../../../shared/logs/event-error-log';
import { parseOrRejectMessage } from '../../../shared/validators/parse-or-reject-message';
import { applicationValidateOrReject } from '../../../shared/validators/validate-or-reject';
import { PlanSubscriptionCreatedMessageDto } from '../entities/plan-subscription-created-message/dto';
import { PlanSubscriptionsDatabaseRepository } from '../repositories/database.repository';
import { HandlePlanSubscriptionCreatedDto } from './handle-plan-subscription-created.dto';

@Injectable()
export class HandlePlanSubscriptionCreatedService {
  constructor(
    private readonly planSubscriptionsDatabaseRepository: PlanSubscriptionsDatabaseRepository,
    private readonly logger: ApplicationLogger
  ) {}

  async execute({ topic, partition, message }: HandlePlanSubscriptionCreatedDto): Promise<void> {
    try {
      // validate
      const parsedMessage = parseOrRejectMessage(message.value);
      const planSubscriptionCreatedMessageDto = plainToInstance(PlanSubscriptionCreatedMessageDto, parsedMessage);
      await applicationValidateOrReject(planSubscriptionCreatedMessageDto);

      // Execute
      console.log(`parsedMessage`, parsedMessage);
      await this.planSubscriptionsDatabaseRepository.create(planSubscriptionCreatedMessageDto);

      // Log
      this.logger.info('Plan subscription created', { ...planSubscriptionCreatedMessageDto });
    } catch (error) {
      new EventErrorLog(this.logger, error, { topic, partition, message });
    }
  }
}
