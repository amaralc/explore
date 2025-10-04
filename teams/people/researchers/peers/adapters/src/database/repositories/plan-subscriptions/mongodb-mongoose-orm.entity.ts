import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { PlanSubscriptionDto } from '@peerlab/researchers/peers/core/domains/plan-subscriptions/entities/plan-subscription/dto';
import { Document } from 'mongoose';

@Schema({ collection: 'PlanSubscriptions' })
export class MongoosePlanSubscription extends Document implements PlanSubscriptionDto {
  @Prop({ type: String })
  override id!: string;

  @Prop({ type: String })
  email!: string;

  @Prop({ type: String })
  plan!: string;

  @Prop({ type: Boolean })
  isActive!: boolean;
}

export const MongoosePlanSubscriptionSchema = SchemaFactory.createForClass(MongoosePlanSubscription);
