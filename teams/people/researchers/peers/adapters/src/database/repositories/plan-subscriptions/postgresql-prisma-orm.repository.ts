import { ConflictException, Injectable } from '@nestjs/common';
import { PLAN_SUBSCRIPTIONS_ERROR_MESSAGES } from '@peerlab/researchers/peers/core/domains/plan-subscriptions/constants/error-messages';
import { PlanSubscriptionEntity } from '@peerlab/researchers/peers/core/domains/plan-subscriptions/entities/plan-subscription/entity';
import { PlanSubscriptionsDatabaseRepository } from '@peerlab/researchers/peers/core/domains/plan-subscriptions/repositories/database.repository';
import { CreatePlanSubscriptionDto } from '@peerlab/researchers/peers/core/domains/plan-subscriptions/services/create-plan-subscription.dto';
import { ListPaginatedPlanSubscriptionsDto } from '@peerlab/researchers/peers/core/domains/plan-subscriptions/services/list-paginated-plan-subscriptions.dto';
import { pagination } from '@peerlab/researchers/peers/core/shared/config';
import { PostgreSqlPrismaOrmService } from '../../infra/prisma/postgresql-prisma-orm.service';

@Injectable()
export class PostgreSqlPrismaOrmPlanSubscriptionsDatabaseRepository implements PlanSubscriptionsDatabaseRepository {
  constructor(private readonly postgreSqlPrismaOrmService: PostgreSqlPrismaOrmService) {}

  async create(createPlanSubscriptionDto: CreatePlanSubscriptionDto): Promise<PlanSubscriptionEntity> {
    const { email, plan } = createPlanSubscriptionDto;
    const subscriptionExists = await this.findByEmail(email);
    if (subscriptionExists) {
      throw new ConflictException(PLAN_SUBSCRIPTIONS_ERROR_MESSAGES['CONFLICTING_EMAIL']);
    }

    const prismaPlanSubscription = await this.postgreSqlPrismaOrmService.plan_subscriptions.create({
      data: { is_active: true, email, plan },
    });

    const applicationPlanSubscription = new PlanSubscriptionEntity({
      id: prismaPlanSubscription.id,
      email: prismaPlanSubscription.email,
      plan,
      isActive: prismaPlanSubscription.is_active,
    });
    return applicationPlanSubscription;
  }

  async findByEmail(email: string): Promise<PlanSubscriptionEntity | null> {
    const prismaPlanSubscription = await this.postgreSqlPrismaOrmService.plan_subscriptions.findFirst({
      where: {
        email,
      },
    });
    if (!prismaPlanSubscription) {
      return null;
    }

    const applicationPlanSubscription = new PlanSubscriptionEntity({
      id: prismaPlanSubscription.id,
      isActive: prismaPlanSubscription.is_active,
      email: prismaPlanSubscription.email,
      plan: prismaPlanSubscription.plan,
    });
    return applicationPlanSubscription;
  }

  async listPaginated(listPaginatedPlanSubscriptionsDto: ListPaginatedPlanSubscriptionsDto) {
    const { limit, page } = listPaginatedPlanSubscriptionsDto;
    const localLimit = limit || pagination.defaultLimit;
    const localOffset = page ? page - 1 : pagination.defaultPage - 1;

    const prismaPlanSubscriptions = await this.postgreSqlPrismaOrmService.plan_subscriptions.findMany({
      skip: localOffset,
      take: localLimit,
    });
    const planSubscriptionEntities = prismaPlanSubscriptions.map(
      (subscription) =>
        new PlanSubscriptionEntity({
          id: subscription.id,
          isActive: subscription.is_active,
          email: subscription.email,
          plan: subscription.plan,
        })
    );
    return planSubscriptionEntities;
  }

  async deleteAll(): Promise<void> {
    console.log('delete all');
  }
}
