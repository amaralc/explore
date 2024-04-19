import { firebaseIdFormat, iso8601DateFormat, mongoDbIdFormat } from '@peerlab/kernel/shared-ts-utils/date-formats';
import { MongoDbMemoryServer } from '@peerlab/kernel/shared-ts-utils/drivers/mongodb-memory-server';
import { ConfigurationManager } from '@peerlab/people/organizations-management/base/config/configuration-management';
import { fakeAgentsByIdOrEmail } from '@peerlab/people/organizations-management/base/domains/agents-v1/core/fixtures';
import { IOrganizationV1Dto } from '@peerlab/people/organizations-management/base/domains/organizations-v1/core/entity';
import { CreateOrganizationV1InputDto } from '@peerlab/people/organizations-management/base/domains/organizations-v1/core/use-cases/create-organization';
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
    const requestBody: CreateOrganizationV1InputDto = {
      nickname: 'fake-organization',
      email: 'fake-organization@email.com',
      ownerAgentId: fakeAgentsByIdOrEmail.get('fake-agent@email.com').id,
      planSubscriptionName: 'FREE',
    };

    const expectedResponseBody: IOrganizationV1Dto = {
      id: expect.stringMatching(mongoDbIdFormat),
      agentId: expect.stringMatching(firebaseIdFormat),
      nickname: requestBody.nickname,
      email: requestBody.email,
      ownerAgentId: requestBody.ownerAgentId,
      planSubscriptionName: requestBody.planSubscriptionName,
      createdAt: expect.stringMatching(iso8601DateFormat),
      updatedAt: expect.stringMatching(iso8601DateFormat),
    };

    await request
      .post('/api/v1/organizations')
      .send(requestBody)
      .then(async (response) => {
        expect(response.status).toEqual(201);
        expect(response.body).toEqual(expectedResponseBody);

        await request.get(`/api/v1/organizations/${response.body.id}`).then((response) => {
          expect(response.status).toEqual(200);
          expect(response.body).toEqual(expectedResponseBody);
        });
      });
  });
});
