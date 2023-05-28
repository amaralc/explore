// planSubscriptions.repository.ts
import { ConflictException, Injectable } from '@nestjs/common';
import { pagination } from '../../../shared/config';
import { PLAN_SUBSCRIPTIONS_ERROR_MESSAGES } from '../constants/error-messages';
import { PlanSubscriptionEntity } from '../entities/plan-subscription/entity';
import { CreatePlanSubscriptionDto } from '../services/create-plan-subscription.dto';
import { ListPaginatedPlanSubscriptionsDto } from '../services/list-paginated-plan-subscriptions.dto';
import { PlanSubscriptionsDatabaseRepository } from './database.repository';

@Injectable()
export class InMemoryPlanSubscriptionsDatabaseRepository implements PlanSubscriptionsDatabaseRepository {
  private planSubscriptions: PlanSubscriptionEntity[] = [];

  async create(createPlanSubscriptionDto: CreatePlanSubscriptionDto): Promise<PlanSubscriptionEntity> {
    const { email } = createPlanSubscriptionDto;
    const isExistingPlanSubscription = await this.findByEmail(email);

    if (isExistingPlanSubscription) {
      throw new ConflictException(PLAN_SUBSCRIPTIONS_ERROR_MESSAGES['CONFLICTING_EMAIL']);
    }
    const planSubscription = new PlanSubscriptionEntity(createPlanSubscriptionDto);
    this.planSubscriptions.push(planSubscription);
    return planSubscription;
  }

  async findByEmail(email: string): Promise<PlanSubscriptionEntity | null> {
    return this.planSubscriptions.find((planSubscription) => planSubscription.email === email) || null;
  }

  async listPaginated(listPaginatedPlanSubscriptionsDto: ListPaginatedPlanSubscriptionsDto) {
    const { limit, page } = listPaginatedPlanSubscriptionsDto;
    const localLimit = limit || pagination.defaultLimit;
    const localOffset = page ? page - 1 : pagination.defaultPage - 1;

    const inMemoryPlanSubscriptions = [...this.planSubscriptions].slice(localOffset, localLimit);
    const planSubscriptionEntities = inMemoryPlanSubscriptions.map(
      (inMemoryPlanSubscription) =>
        new PlanSubscriptionEntity({
          ...inMemoryPlanSubscription,
        })
    );
    return planSubscriptionEntities;
  }

  async deleteAll(): Promise<void> {
    this.planSubscriptions = [];
  }
}
