import { OrganizationsV1Repository } from '../repository';
import { InMemoryOrganizationsV1Repository } from '../repository-in-memory';
import { GetOrganizationV1ByIdUseCase } from './get-organization-by-id';

describe('Get OrganizationV1', () => {
  let organizationsV1Repository: OrganizationsV1Repository;
  let getOrganizationV1ByIdUseCase: GetOrganizationV1ByIdUseCase;

  beforeEach(async () => {
    organizationsV1Repository = new InMemoryOrganizationsV1Repository();
    getOrganizationV1ByIdUseCase = new GetOrganizationV1ByIdUseCase(organizationsV1Repository);
  });

  it('should get an organization by its id', async () => {
    const expectedOrganizationV1 = await organizationsV1Repository.create({
      id: organizationsV1Repository.generateUniqueId(),
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
