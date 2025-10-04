import { randomUUID } from 'crypto';
import { Replace } from '../../../../shared/utils/replace';
import { PlanSubscriptionDto } from './dto';

type IMakePlanSubscriptionProps = Replace<PlanSubscriptionDto, { id?: string; isActive?: boolean }>;

export class PlanSubscriptionEntity extends PlanSubscriptionDto {
  constructor({ id, email, isActive, plan }: IMakePlanSubscriptionProps) {
    super();
    this.id = id ?? randomUUID();
    this.isActive = isActive ?? true;
    this.email = email;
    this.plan = plan;
  }
}
