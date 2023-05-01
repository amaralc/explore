import { PlanSubscriptionEntity } from '../entities/plan-subscription/entity';
import { CreatePlanSubscriptionDto } from '../services/create-plan-subscription.dto';
import { ListPaginatedPlanSubscriptionsDto } from '../services/list-paginated-plan-subscriptions.dto';

// Abstraction
export abstract class PlanSubscriptionsDatabaseRepository {
  abstract create(createPlanSubscriptionDto: CreatePlanSubscriptionDto): Promise<PlanSubscriptionEntity>;
  abstract listPaginated(
    listPaginatedPlanSubscriptionsDto: ListPaginatedPlanSubscriptionsDto
  ): Promise<Array<PlanSubscriptionEntity>>;
  abstract findByEmail(email: string): Promise<PlanSubscriptionEntity | null>;
  abstract deleteAll(): Promise<void>;
}
