import { firebaseIdFormat, iso8601DateFormat, mongoDbIdFormat } from '@peerlab/kernel/shared-ts-utils/date-formats';
import { CreateOrganizationV1InputDto, CreateOrganizationV1UseCase } from '.';
import { AgentsV1DatabaseRepository } from '../../../../agents-v1/core/database-repository';
import { InMemoryAgentsV1Repository } from '../../../../agents-v1/core/database-repository-in-memory';
import { AgentV1Entity } from '../../../../agents-v1/core/entity';
import { fakeAgents, fakeAgentsByIdOrEmail } from '../../../../agents-v1/core/fixtures';
import { OrganizationsV1DatabaseRepository } from '../../database-repository';
import { InMemoryOrganizationsV1Repository } from '../../database-repository-in-memory';
import { IOrganizationV1Dto } from '../../entity';

describe('Create OrganizationV1 with free plan subscription', () => {
  let organizationsV1Repository: OrganizationsV1DatabaseRepository;
  let agentsV1Repository: AgentsV1DatabaseRepository;
  let createOrganizationUseCase: CreateOrganizationV1UseCase;

  beforeEach(async () => {
    organizationsV1Repository = new InMemoryOrganizationsV1Repository();
    agentsV1Repository = new InMemoryAgentsV1Repository();
    agentsV1Repository.createMany(fakeAgents);
    createOrganizationUseCase = new CreateOrganizationV1UseCase(organizationsV1Repository, agentsV1Repository);
  });

  it('should create an organization for an agent of type individual', async () => {
    const createOrganizationInputDto: CreateOrganizationV1InputDto = {
      nickname: 'valid-organization-nickname',
      email: 'new-organization@email.com',
      ownerAgentId: fakeAgentsByIdOrEmail.get('fake-agent-owner-of-free-organization@email.com').id,
      planSubscriptionName: 'FREE',
    };

    const expectedOrganizationV1: IOrganizationV1Dto = {
      id: expect.stringMatching(mongoDbIdFormat),
      agentId: expect.stringMatching(firebaseIdFormat),
      ownerAgentId: createOrganizationInputDto.ownerAgentId,
      nickname: createOrganizationInputDto.nickname,
      planSubscriptionName: createOrganizationInputDto.planSubscriptionName,
      email: createOrganizationInputDto.email,
      idPath: expect.stringMatching(/^\/([a-f0-9]{24})$/), // Starts with '/', followed by a hexadecimal string of 24 characters
      createdAt: expect.stringMatching(iso8601DateFormat),
      updatedAt: expect.stringMatching(iso8601DateFormat),
    };

    const createdOrganization = await createOrganizationUseCase.execute(createOrganizationInputDto);
    expect(createdOrganization).toEqual(expectedOrganizationV1);
  });

  it.todo('should create an organization for an agent of type organization');

  it('should not allow creating two organizations with the same nickname', async () => {
    const createOrganizationInputDto: CreateOrganizationV1InputDto = {
      nickname: 'valid-organization-nickname',
      email: 'new-organization@email.com',
      ownerAgentId: fakeAgentsByIdOrEmail.get('fake-agent-owner-of-free-organization@email.com').id,
      planSubscriptionName: 'FREE',
    };

    const duplicatedNicknameOrganizationInputDto: CreateOrganizationV1InputDto = {
      nickname: createOrganizationInputDto.nickname,
      email: 'non-duplicated@email.com',
      ownerAgentId: fakeAgentsByIdOrEmail.get('fake-agent-owner-of-free-organization@email.com').id,
      planSubscriptionName: 'FREE',
    };

    await createOrganizationUseCase.execute(createOrganizationInputDto);
    await expect(createOrganizationUseCase.execute(duplicatedNicknameOrganizationInputDto)).rejects.toThrow(
      'Organization with same nickname already exists',
    );
  });

  it('should not allow creating an organization with an email already used by an individual agent', async () => {
    const otherIndividualAgent = await agentsV1Repository.create({
      id: 'other-individual-agent-id',
      email: 'other-individual-agent@email.com',
      nickname: AgentV1Entity.generateNicknameFromEmail('other-individual-agent@email.com'),
      type: 'INDIVIDUAL',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    const createOrganizationInputDto: CreateOrganizationV1InputDto = {
      nickname: 'valid-organization-nickname',
      email: otherIndividualAgent.email,
      ownerAgentId: fakeAgentsByIdOrEmail.get('fake-agent-owner-of-free-organization@email.com').id,
      planSubscriptionName: 'FREE',
    };

    await expect(createOrganizationUseCase.execute(createOrganizationInputDto)).rejects.toThrow(
      'Another individual agent with same email already exists. Please use another email.',
    );
  });
});
