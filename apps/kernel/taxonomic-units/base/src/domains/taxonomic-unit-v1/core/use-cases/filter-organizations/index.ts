import { IPaginatedEntitiesV2 } from '@peerlab/kernel/shared-ts-utils/paginated-entities';
import { AgentsV1DatabaseRepository } from '../../../../agents-v1/core/database-repository';
import { OrganizationsV1DatabaseRepository } from '../../database-repository';
import { IFilterOrganizationV1InputDto } from '../../database-repository.types';
import { IOrganizationV1Dto } from '../../entity.schema.types';
import { OwnerAgentNotFoundError } from '../../errors';

export class FilterOrganizationsV1UseCase {
  constructor(
    private readonly organizationsV1Repository: OrganizationsV1DatabaseRepository,
    private readonly agentsV1Repository: AgentsV1DatabaseRepository,
  ) {}

  public async execute(inputDto: IFilterOrganizationV1InputDto): Promise<IPaginatedEntitiesV2<IOrganizationV1Dto>> {
    if (inputDto.query.ownerAgentId) {
      const ownerAgent = await this.agentsV1Repository.getAgentById(inputDto.query.ownerAgentId);
      if (!ownerAgent) {
        throw new OwnerAgentNotFoundError(`Owner agent with id ${inputDto.query.ownerAgentId} not found`);
      }
    }

    const paginatedResult = await this.organizationsV1Repository.filterPaginated(inputDto);
    return paginatedResult;
  }
}
