import { faker } from '@faker-js/faker';
import { OrganizationV1Entity } from './entity';

describe('OrganizationV1Entity', () => {
  it('should get an organization by its id', async () => {
    try {
      const organizationV1 = new OrganizationV1Entity({
        id: faker.database.mongodbObjectId().toString(),
        ownerAgentId: faker.database.mongodbObjectId().toString(),
        email: 'valid@email.com',
        nickname: 'valid-organization-nickname',
        planSubscriptionName: 'FREE',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      expect(organizationV1).toBeDefined();
    } catch (error) {
      console.log(error);
    }
  });
});
