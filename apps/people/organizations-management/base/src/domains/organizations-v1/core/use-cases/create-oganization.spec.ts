import { ValidationExceptionV1 } from '@peerlab/people/organizations-management/base/utils/errors/validation-exception-v1';
import { iso8601DateFormat } from '../../../../utils/date-formats';
import { AgentsV1DatabaseRepository } from '../../../agents-v1/core/database-repository';
import { InMemoryAgentsV1Repository } from '../../../agents-v1/core/database-repository-in-memory';
import { fakeAgents, fakeAgentsByIdOrEmail } from '../../../agents-v1/core/fixtures';
import { IOrganizationV1Dto } from '../entity';
import { OrganizationsV1Repository } from '../repository';
import { InMemoryOrganizationsV1Repository } from '../repository-in-memory';
import {
  CreateOrganizationV1InputDto,
  CreateOrganizationV1UseCase,
  createOrgaNizationV1InputDtoSchema,
} from './create-organization';

describe('Create OrganizationV1 with free plan subscription', () => {
  let organizationsV1Repository: OrganizationsV1Repository;
  let agentsV1Repository: AgentsV1DatabaseRepository;
  let createOrganizationUseCase: CreateOrganizationV1UseCase;

  beforeEach(async () => {
    organizationsV1Repository = new InMemoryOrganizationsV1Repository();
    agentsV1Repository = new InMemoryAgentsV1Repository();
    agentsV1Repository.createMany(fakeAgents);
    createOrganizationUseCase = new CreateOrganizationV1UseCase(organizationsV1Repository, agentsV1Repository);
  });

  it('should log', () => {
    console.log(createOrgaNizationV1InputDtoSchema);
  });

  it('should create an organization', async () => {
    const createOrganizationInputDto: CreateOrganizationV1InputDto = {
      nickname: 'valid-organization-nickname',
      email: 'new-organization@email.com',
      ownerAgentId: fakeAgentsByIdOrEmail.get('fake-agent@email.com').id,
      planSubscriptionName: 'FREE',
    };

    const expectedOrganizationV1: IOrganizationV1Dto = {
      id: expect.any(String),
      nickname: createOrganizationInputDto.nickname,
      planSubscriptionName: createOrganizationInputDto.planSubscriptionName,
      email: createOrganizationInputDto.email,
      ownerAgentId: createOrganizationInputDto.ownerAgentId,
      createdAt: expect.stringMatching(iso8601DateFormat),
      updatedAt: expect.stringMatching(iso8601DateFormat),
    };

    const createdOrganization = await createOrganizationUseCase.execute(createOrganizationInputDto);
    expect(createdOrganization).toEqual(expectedOrganizationV1);
  });

  it('should require a nickname more than 3 characters long', async () => {
    const createOrganizationInputDto: CreateOrganizationV1InputDto = {
      nickname: 'inv',
      email: 'new-organization@email.com',
      ownerAgentId: fakeAgentsByIdOrEmail.get('fake-agent@email.com').id,
      planSubscriptionName: 'FREE',
    };

    await expect(createOrganizationUseCase.execute(createOrganizationInputDto)).rejects.toThrow(ValidationExceptionV1);

    const paginatedOrganizations = await organizationsV1Repository.listPaginated({ limit: 1, page: 1 });
    expect(paginatedOrganizations).toEqual({
      total: 0,
      totalPages: 1,
      currentPage: 1,
      entities: [],
    });
  });

  it('should not create an organization for an invalid owner agent id', async () => {
    const createOrganizationInputDto: CreateOrganizationV1InputDto = {
      nickname: 'valid-organization-nickname',
      email: 'new-organization@email.com',
      ownerAgentId: 'invalid-agent-id',
      planSubscriptionName: 'FREE',
    };

    await expect(createOrganizationUseCase.execute(createOrganizationInputDto)).rejects.toThrow(Error);
  });

  it('should not allow creating two organizations with the same nickname', async () => {
    const createOrganizationInputDto: CreateOrganizationV1InputDto = {
      nickname: 'valid-organization-nickname',
      email: 'new-organization@email.com',
      ownerAgentId: fakeAgentsByIdOrEmail.get('fake-agent@email.com').id,
      planSubscriptionName: 'FREE',
    };

    const duplicatedNicknameOrganizationInputDto: CreateOrganizationV1InputDto = {
      nickname: createOrganizationInputDto.nickname,
      email: 'non-duplicated@email.com',
      ownerAgentId: fakeAgentsByIdOrEmail.get('fake-agent@email.com').id,
      planSubscriptionName: 'FREE',
    };

    await createOrganizationUseCase.execute(createOrganizationInputDto);
    await expect(createOrganizationUseCase.execute(duplicatedNicknameOrganizationInputDto)).rejects.toThrow(
      'Organization with same nickname already exists',
    );
  });

  it('should not allow creating two organizations with the same email', async () => {
    const createOrganizationInputDto: CreateOrganizationV1InputDto = {
      nickname: 'valid-organization-nickname',
      email: 'new-organization@email.com',
      ownerAgentId: fakeAgentsByIdOrEmail.get('fake-agent@email.com').id,
      planSubscriptionName: 'FREE',
    };

    const duplicatedEmailOrganizationInputDto: CreateOrganizationV1InputDto = {
      nickname: 'non-duplicated-organization-nickname',
      email: createOrganizationInputDto.email,
      ownerAgentId: fakeAgentsByIdOrEmail.get('fake-agent@email.com').id,
      planSubscriptionName: 'FREE',
    };

    await createOrganizationUseCase.execute(createOrganizationInputDto);
    await expect(createOrganizationUseCase.execute(duplicatedEmailOrganizationInputDto)).rejects.toThrow(
      'Organization with same email already exists',
    );
  });

  it('should not allow creating an organization with an email already used by an individual agent', async () => {
    const otherIndividualAgent = await agentsV1Repository.create({
      id: 'other-individual-agent-id',
      email: 'other-individual-agent@email.com',
      type: 'INDIVIDUAL',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    const createOrganizationInputDto: CreateOrganizationV1InputDto = {
      nickname: 'valid-organization-nickname',
      email: otherIndividualAgent.email,
      ownerAgentId: fakeAgentsByIdOrEmail.get('fake-agent@email.com').id,
      planSubscriptionName: 'FREE',
    };

    await expect(createOrganizationUseCase.execute(createOrganizationInputDto)).rejects.toThrow(
      'Another individual agent with same email already exists. Please use another email.',
    );
  });
});
