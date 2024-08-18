import { MongoDbMemoryServer } from '@peerlab/kernel/shared-ts-utils/drivers/mongodb-memory-server';
import { ConfigurationManager } from '@peerlab/kernel/taxonomic-units/base/config/configuration-management';
import { fakeOrganizationsByIdOrEmail } from '@peerlab/kernel/taxonomic-units/base/domains/organizations-v1/core/fixtures';
import supertest from 'supertest';
import { bootstrapApplication } from '../../../../../app';

describe('GET /api/v1/organizations/{id}', () => {
  let request: supertest.SuperAgentTest;
  let configurationManager: ConfigurationManager;
  let databaseUri: string;

  beforeAll(async () => {
    configurationManager = new ConfigurationManager();
    const result = await MongoDbMemoryServer.initializeInMemoryDatabase();
    databaseUri = result.databaseUri;
    // Override the default configuration with in memory database configuration
    configurationManager.setConfig({
      ...configurationManager.getConfig(),
      database: {
        ...configurationManager.getConfig().database,
        uri: databaseUri,
      },
    });
  });

  beforeEach(async () => {
    const { app } = await bootstrapApplication(configurationManager);
    request = supertest.agent(app);
  });

  it('should get an existing organization by its id', async () => {
    const existingOrganization = fakeOrganizationsByIdOrEmail.get('fake-organization-agent-root-01@email.com');

    await request.get(`/api/v1/organizations/${existingOrganization.id}`).then((response) => {
      expect(response.status).toEqual(200);
      expect(response.body).toEqual(existingOrganization);
    });
  });
});
