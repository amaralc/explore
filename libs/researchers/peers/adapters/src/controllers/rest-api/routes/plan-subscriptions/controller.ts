import { Controller, Get, Query } from '@nestjs/common';
import { ListPaginatedPlanSubscriptionsService } from '@peerlab/researchers/peers/core/domains/plan-subscriptions/services/list-paginated-plan-subscriptions.service';
import { PaginationQueryDto } from '@peerlab/researchers/peers/core/shared/dto/pagination-query.dto';

@Controller('plan-subscriptions')
export class PlanSubscriptionsRestController {
  constructor(private listPaginatedPlanSubscriptionsService: ListPaginatedPlanSubscriptionsService) {}

  @Get()
  async findAll(@Query() paginationQuery: PaginationQueryDto) {
    const planSubscriptions = await this.listPaginatedPlanSubscriptionsService.execute(paginationQuery);
    return { planSubscriptions };
  }
}
