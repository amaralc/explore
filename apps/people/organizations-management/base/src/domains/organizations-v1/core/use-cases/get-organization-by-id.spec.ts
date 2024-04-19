import { AgentsV1DatabaseRepository } from '../../../agents-v1/core/database-repository';
import { InMemoryAgentsV1Repository } from '../../../agents-v1/core/database-repository-in-memory';
import { AgentV1Entity } from '../../../agents-v1/core/entity';
import { OrganizationsV1Repository } from '../repository';
import { InMemoryOrganizationsV1Repository } from '../repository-in-memory';
import { GetOrganizationV1ByIdUseCase } from './get-organization-by-id';

describe('Get OrganizationV1', () => {
  let organizationsV1Repository: OrganizationsV1Repository;
  let getOrganizationV1ByIdUseCase: GetOrganizationV1ByIdUseCase;
  let agentsV1DatabaseRepository: AgentsV1DatabaseRepository;

  beforeEach(async () => {
    organizationsV1Repository = new InMemoryOrganizationsV1Repository();
    getOrganizationV1ByIdUseCase = new GetOrganizationV1ByIdUseCase(organizationsV1Repository);
    agentsV1DatabaseRepository = new InMemoryAgentsV1Repository();
  });

  it('should get an organization by its id', async () => {
    const userAgent = await agentsV1DatabaseRepository.create({
      id: agentsV1DatabaseRepository.generateUniqueId(),
      nickname: AgentV1Entity.generateNicknameFromEmail('fake-user@email.com'),
      email: 'fake-user@email.com',
      type: 'INDIVIDUAL',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    const organizationAgent = await agentsV1DatabaseRepository.create({
      id: agentsV1DatabaseRepository.generateUniqueId(),
      nickname: 'valid-organization-nickname',
      email: userAgent.email,
      type: 'ORGANIZATION',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    const expectedOrganizationV1 = await organizationsV1Repository.create({
      id: organizationsV1Repository.generateUniqueId(),
      agentId: organizationAgent.id,
      email: 'valid-organization@email.com',
      nickname: 'valid-organization-nickname',
      planSubscriptionName: 'FREE',
      ownerAgentId: 'fake-owner-id',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    const organizationById = await getOrganizationV1ByIdUseCase.execute(expectedOrganizationV1.id);
    expect(expectedOrganizationV1).toEqual(organizationById);
  });
});
