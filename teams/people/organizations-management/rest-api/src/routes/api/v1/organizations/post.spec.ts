import { firebaseIdFormat, iso8601DateFormat, mongoDbIdFormat } from '@peerlab/kernel/shared-ts-utils/date-formats';
import { MongoDbDriver } from '@peerlab/kernel/shared-ts-utils/drivers/mongodb-driver';
import { MongoDbMemoryServer } from '@peerlab/kernel/shared-ts-utils/drivers/mongodb-memory-server';
import { ConfigurationManager } from '@peerlab/people/organizations-management/base/config/configuration-management';
import { fakeAgentsByIdOrEmail } from '@peerlab/people/organizations-management/base/domains/agents-v1/core/fixtures';
import { IOrganizationV1Dto } from '@peerlab/people/organizations-management/base/domains/organizations-v1/core/entity.schema.types';
import { CreateOrganizationV1InputDto } from '@peerlab/people/organizations-management/base/domains/organizations-v1/core/use-cases/create-organization';
import { randomBytes } from 'crypto';
import supertest from 'supertest';
import { bootstrapApplication } from '../../../../app';
describe('POST /v1/organizations', () => {
  let request: supertest.SuperAgentTest;
  let configurationManager: ConfigurationManager;
  let databaseUri: string;
  let testMongoDbDriver: MongoDbDriver;
  const databaseName = 'test-organizations-management';
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
        name: databaseName,
      },
    });
    testMongoDbDriver = new MongoDbDriver(databaseUri);
    await testMongoDbDriver.connectToDatabase(databaseName);
  });
  beforeEach(async () => {
    // Drop the database before each test
    await testMongoDbDriver.dropDatabase(databaseName);
    const { app } = await bootstrapApplication(configurationManager);
    request = supertest.agent(app);
  });
  it('should create an OrganizationV1 using the REST API, responding with 201 HTTP status', async () => {
    const requestBody: CreateOrganizationV1InputDto = {
      nickname: 'fake-organization',
      email: 'fake-organization@email.com',
      ownerAgentId: fakeAgentsByIdOrEmail.get('fake-agent-with-no-free-organization@email.com').id,
      planSubscriptionName: 'FREE',
    };
    await request
      .post('/api/v1/organizations')
      .send(requestBody)
      .then((response) => {
        expect(response.status).toEqual(201);
        const expectedResponseBody: IOrganizationV1Dto = {
          id: expect.stringMatching(mongoDbIdFormat),
          agentId: expect.stringMatching(firebaseIdFormat),
          nickname: requestBody.nickname,
          ownerAgentId: requestBody.ownerAgentId,
          email: requestBody.email,
          planSubscriptionName: requestBody.planSubscriptionName,
          idPath: `/${response.body.id}`,
          createdAt: expect.stringMatching(iso8601DateFormat),
          updatedAt: expect.stringMatching(iso8601DateFormat),
        };
        expect(response.body).toEqual(expectedResponseBody);
      });
  });
  it('should not allow agent to have more then one free organization, responding with 409 HTTP status', async () => {
    const requestBody: CreateOrganizationV1InputDto = {
      nickname: 'fake-organization',
      email: 'fake-organization@email.com',
      ownerAgentId: fakeAgentsByIdOrEmail.get('fake-agent-owner-of-free-organization@email.com').id,
      planSubscriptionName: 'FREE',
    };
    await request
      .post('/api/v1/organizations')
      .send(requestBody)
      .then((response) => {
        expect(response.status).toEqual(409);
        expect(response.body.message).toEqual('Owner agent already have a free organization');
      });
  });
  it('should not allow creating an organization when ownerAgentId is not found, responding with 404 HTTP status', async () => {
    const requestBody: CreateOrganizationV1InputDto = {
      nickname: 'fake-organization',
      email: 'fake-organization@email.com',
      ownerAgentId: randomBytes(14).toString('hex'),
      planSubscriptionName: 'FREE',
    };
    await request
      .post('/api/v1/organizations')
      .send(requestBody)
      .then((response) => {
        expect(response.status).toEqual(404);
        expect(response.body.message).toEqual(`Owner agent with id ${requestBody.ownerAgentId} not found`);
      });
  });
  it.todo('should not allow unauthorized requests, responding with 401 HTTP status');
  it.todo('should not allow unauthenticated requests, responding with 403 HTTP status');
});
