import { ConflictException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { PLAN_SUBSCRIPTIONS_ERROR_MESSAGES } from '@peerlab/researchers/peers/core/domains/plan-subscriptions/constants/error-messages';
import { PlanSubscriptionEntity } from '@peerlab/researchers/peers/core/domains/plan-subscriptions/entities/plan-subscription/entity';
import { PlanSubscriptionsDatabaseRepository } from '@peerlab/researchers/peers/core/domains/plan-subscriptions/repositories/database.repository';
import { CreatePlanSubscriptionDto } from '@peerlab/researchers/peers/core/domains/plan-subscriptions/services/create-plan-subscription.dto';
import { ListPaginatedPlanSubscriptionsDto } from '@peerlab/researchers/peers/core/domains/plan-subscriptions/services/list-paginated-plan-subscriptions.dto';
import { pagination } from '@peerlab/researchers/peers/core/shared/config';
import { Model } from 'mongoose';
import { MongoosePlanSubscription } from './mongodb-mongoose-orm.entity';

@Injectable()
export class MongoDbMongooseOrmPlanSubscriptionsDatabaseRepository implements PlanSubscriptionsDatabaseRepository {
  constructor(
    @InjectModel(MongoosePlanSubscription.name)
    private readonly planSubscriptionModel: Model<MongoosePlanSubscription>
  ) {}

  async create(createPlanSubscriptionDto: CreatePlanSubscriptionDto): Promise<PlanSubscriptionEntity> {
    const { email, plan } = createPlanSubscriptionDto;
    const subscriptionExists = await this.findByEmail(email);
    if (subscriptionExists) {
      throw new ConflictException(PLAN_SUBSCRIPTIONS_ERROR_MESSAGES['CONFLICTING_EMAIL']);
    }

    const mongoosePlanSubscription = new this.planSubscriptionModel({
      isActive: true,
      email,
      plan,
    });

    mongoosePlanSubscription.save();

    const applicationPlanSubscription = new PlanSubscriptionEntity({
      id: mongoosePlanSubscription.id,
      email: mongoosePlanSubscription.email,
      isActive: mongoosePlanSubscription.isActive,
      plan,
    });
    return applicationPlanSubscription;
  }

  async findByEmail(email: string): Promise<PlanSubscriptionEntity | null> {
    const mongoosePlanSubscription = await this.planSubscriptionModel
      .findOne({
        email,
      })
      .exec();
    if (!mongoosePlanSubscription) {
      return null;
    }

    const applicationPlanSubscription = new PlanSubscriptionEntity({
      id: mongoosePlanSubscription.id,
      isActive: mongoosePlanSubscription.isActive,
      email: mongoosePlanSubscription.email,
      plan: mongoosePlanSubscription.plan,
    });
    return applicationPlanSubscription;
  }

  async listPaginated(listPaginatedPlanSubscriptionsDto: ListPaginatedPlanSubscriptionsDto) {
    const { limit, page } = listPaginatedPlanSubscriptionsDto;
    const localLimit = limit || pagination.defaultLimit;
    const localOffset = page ? page - 1 : pagination.defaultPage - 1;

    const mongoosePlanSubscriptions = await this.planSubscriptionModel.find().skip(localOffset).limit(localLimit);

    const planSubscriptionEntities = mongoosePlanSubscriptions.map(
      (subscription) =>
        new PlanSubscriptionEntity({
          id: subscription.id,
          isActive: subscription.isActive,
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
