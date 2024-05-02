import { AgentsV1DatabaseRepository } from '../../../agents-v1/core/database-repository';
import { ConvertMultiInstitutionV1InAgentV1Service } from '../../../agents-v1/core/services/convert-multi-institution-v1-in-agent-v1';
import { IMultiInstitutionV1Dto } from '../../../multi-institution-v1/core/types';
import { OrganizationsV1Repository } from '../database-repository';
import { IOrganizationV1Dto } from '../entity';
import { ConvertMultiInstitutionV1InOrganizationV1Service } from '../services/convert-multi-institution-v1-in-organization-v1';

export class CreateOrganizationV1FromMultiInstitutionV1UseCase {
  constructor(
    private readonly agentsV1DatabaseRepository: AgentsV1DatabaseRepository,
    private readonly organizationV1DatabaseRepository: OrganizationsV1Repository,
  ) {}

  async execute(inputDto: IMultiInstitutionV1Dto): Promise<IOrganizationV1Dto> {
    const agentV1 = ConvertMultiInstitutionV1InAgentV1Service.execute({
      multiInstitutionV1Dto: inputDto,
      id: this.organizationV1DatabaseRepository.generateUniqueId(),
    });

    const createdAgentV1 = await this.agentsV1DatabaseRepository.create(agentV1);

    const organizationV1 = ConvertMultiInstitutionV1InOrganizationV1Service.execute({
      agentV1Dto: agentV1,
      id: createdAgentV1.id,
      multiInstitutionV1Dto: inputDto,
      ownerAgentId: agentV1.id,
    });

    const createdOrganizationV1 = await this.organizationV1DatabaseRepository.create(organizationV1);
    return createdOrganizationV1;
  }
}
