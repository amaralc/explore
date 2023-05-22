import { ConflictException, Injectable } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { ApplicationLogger } from '../../../shared/logs/application-logger';
import { applicationValidateOrReject } from '../../../shared/validators/validate-or-reject';
import { PLAN_SUBSCRIPTIONS_ERROR_MESSAGES } from '../constants/error-messages';
import { PlanSubscriptionsDatabaseRepository } from '../repositories/database.repository';
import { CreatePlanSubscriptionDto } from './create-plan-subscription.dto';

@Injectable()
export class CreatePlanSubscriptionService {
  constructor(
    private readonly logger: ApplicationLogger,
    private readonly planSubscriptionsDatabaseRepository: PlanSubscriptionsDatabaseRepository
  ) {}

  async execute(createPlanSubscriptionDto: CreatePlanSubscriptionDto) {
    // validate
    const createPlanSubscriptionDtoInstance = plainToInstance(CreatePlanSubscriptionDto, createPlanSubscriptionDto);
    await applicationValidateOrReject(
      createPlanSubscriptionDtoInstance,
      PLAN_SUBSCRIPTIONS_ERROR_MESSAGES['INVALID_EMAIL']
    );

    const isExistingPlanSubscription = await this.planSubscriptionsDatabaseRepository.findByEmail(
      createPlanSubscriptionDto.email
    );

    if (isExistingPlanSubscription) {
      throw new ConflictException(PLAN_SUBSCRIPTIONS_ERROR_MESSAGES['CONFLICTING_EMAIL']);
    }

    // Execute
    const planSubscription = await this.planSubscriptionsDatabaseRepository.create(createPlanSubscriptionDto);

    // Log
    this.logger.info('Plan subscription stored', { planSubscription, className: CreatePlanSubscriptionService.name });

    return { planSubscription };
  }
}
