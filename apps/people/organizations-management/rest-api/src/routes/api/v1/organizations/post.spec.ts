import { ConfigurationManager } from '@peerlab/people/organizations-management/base/config/configuration-management';
import { MongoDbMemoryServer } from '@peerlab/people/organizations-management/base/database-drivers/mongodb-memory-server';
import { fakeAgentsByIdOrEmail } from '@peerlab/people/organizations-management/base/domains/agents-v1/core/fixtures';
import { CreateOrganizationV1InputDto } from '@peerlab/people/organizations-management/base/domains/organizations-v1/core/use-cases/create-organization';
import { iso8601DateFormat } from '@peerlab/people/organizations-management/base/utils/date-formats';
import supertest from 'supertest';
import { bootstrapApplication } from '../../../../app';

describe('POST /v1/organizations', () => {
  let request: supertest.SuperAgentTest;
  let configurationManager: ConfigurationManager;
  let databaseUri: string;

  beforeAll(async () => {
    configurationManager = new ConfigurationManager();
    databaseUri = await MongoDbMemoryServer.initializeInMemoryDatabase();
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

  it('should create an OrganizationV1 using the REST API', async () => {
    const requestBody: CreateOrganizationV1InputDto = {
      nickname: 'fake-organization',
      email: 'fake-organization@email.com',
      ownerAgentId: fakeAgentsByIdOrEmail.get('fake-agent@email.com').id,
      planSubscriptionName: 'FREE',
    };

    const expectedResponseBody = {
      id: expect.any(String),
      nickname: requestBody.nickname,
      ownerAgentId: requestBody.ownerAgentId,
      email: requestBody.email,
      planSubscriptionName: requestBody.planSubscriptionName,
      createdAt: expect.stringMatching(iso8601DateFormat),
      updatedAt: expect.stringMatching(iso8601DateFormat),
    };

    await request
      .post('/api/v1/organizations')
      .send(requestBody)
      .then((response) => {
        expect(response.status).toEqual(201);
        expect(response.body).toEqual(expectedResponseBody);
      });
  });
});
