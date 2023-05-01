import { ListPaginatedPlanSubscriptionsService } from '@core/domains/plan-subscriptions/services/list-paginated-plan-subscriptions.service';
import { PaginationQueryDto } from '@core/shared/dto/pagination-query.dto';
import { Controller, Get, Query } from '@nestjs/common';

@Controller('plan-subscriptions')
export class PlanSubscriptionsRestController {
  constructor(private listPaginatedPlanSubscriptionsService: ListPaginatedPlanSubscriptionsService) {}

  @Get()
  async findAll(@Query() paginationQuery: PaginationQueryDto) {
    const planSubscriptions = await this.listPaginatedPlanSubscriptionsService.execute(paginationQuery);
    return { planSubscriptions };
  }
}
