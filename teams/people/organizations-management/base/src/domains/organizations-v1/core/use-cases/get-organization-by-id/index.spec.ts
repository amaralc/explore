import { GetOrganizationV1ByIdUseCase } from '.';
import { AgentsV1DatabaseRepository } from '../../../../agents-v1/core/database-repository';
import { InMemoryAgentsV1Repository } from '../../../../agents-v1/core/database-repository-in-memory';
import { AgentV1Entity } from '../../../../agents-v1/core/entity';
import { OrganizationsV1DatabaseRepository } from '../../database-repository';
import { InMemoryOrganizationsV1Repository } from '../../database-repository-in-memory';

describe('Get OrganizationV1', () => {
  let organizationsV1Repository: OrganizationsV1DatabaseRepository;
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

    const newOrganizationId = organizationsV1Repository.generateUniqueId();
    const expectedOrganizationV1 = await organizationsV1Repository.create({
      id: newOrganizationId,
      agentId: organizationAgent.id,
      email: 'valid-organization@email.com',
      nickname: 'valid-organization-nickname',
      planSubscriptionName: 'FREE',
      ownerAgentId: userAgent.id,
      idPath: `/${newOrganizationId}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    const organizationById = await getOrganizationV1ByIdUseCase.execute(expectedOrganizationV1.id);
    expect(expectedOrganizationV1).toEqual(organizationById);
  });
});
