import { MongoDbDriver } from '@peerlab/kernel/shared-ts-utils/drivers/mongodb-driver';
import { MongoDbMemoryServer } from '@peerlab/kernel/shared-ts-utils/drivers/mongodb-memory-server';
import { ConfigurationManager } from '@peerlab/people/organizations-management/base/config/configuration-management';
import { fakeAgentsByIdOrEmail } from '@peerlab/people/organizations-management/base/domains/agents-v1/core/fixtures';
import {
  fakeOrganizations,
  fakeOrganizationsByIdOrEmail,
} from '@peerlab/people/organizations-management/base/domains/organizations-v1/core/fixtures';
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
    testMongoDbDriver = new MongoDbDriver(databaseUri);
    await testMongoDbDriver.connectToDatabase(databaseName);
  });
  beforeEach(async () => {
    // Drop the database before each test
    await testMongoDbDriver.dropDatabase(databaseName);
    // Override the default configuration with in memory database configuration
    configurationManager.setConfig({
      ...configurationManager.getConfig(),
      database: {
        ...configurationManager.getConfig().database,
        uri: databaseUri,
        name: databaseName,
      },
    });
    const { app } = await bootstrapApplication(configurationManager);
    request = supertest.agent(app);
  });
  it('[HTTP 200] should list all organizations, with pagination', async () => {
    await request.get('/api/v1/organizations').then((response) => {
      expect(response.status).toEqual(200);
      expect(response.body).toEqual({
        page: 1,
        pageSize: 10,
        nextPage: null,
        entities: fakeOrganizations,
      });
    });
    await request.get('/api/v1/organizations?page=1&limit=1').then((response) => {
      expect(response.status).toEqual(200);
      expect(response.body).toEqual({
        page: 1,
        pageSize: 1,
        nextPage: 2,
        entities: [fakeOrganizations[0]],
      });
    });
  });
  it('[HTTP 200] should show empty results when there are no organizations', async () => {
    // Agent with single organization
    const agentThatOwnsSingleOrganization = fakeAgentsByIdOrEmail.get(
      'fake-agent-owner-of-free-organization@email.com',
    );
    await request
      .get(`/api/v1/organizations?page=2&limit=1&ownerAgentId=${agentThatOwnsSingleOrganization.id}`)
      .then((response) => {
        expect(response.status).toEqual(200);
        expect(response.body).toEqual({
          page: 2,
          pageSize: 1,
          nextPage: null,
          entities: [],
        });
      });
  });
  it('[HTTP 200] should list organizations owned by an agent with explicit and default pagination', async () => {
    const individualOwnerAgentId = fakeAgentsByIdOrEmail.get('fake-agent-owner-of-free-organization@email.com').id;
    await request
      .get(`/api/v1/organizations?page=1&limit=1&ownerAgentId=${individualOwnerAgentId}`)
      .then((response) => {
        expect(response.status).toEqual(200);
        expect(response.body).toEqual({
          page: 1,
          pageSize: 1,
          nextPage: null,
          entities: [fakeOrganizationsByIdOrEmail.get('fake-organization-agent-root-01@email.com')],
        });
      });
    const organizationOwnerAgentId = fakeAgentsByIdOrEmail.get('fake-organization-agent-root-01@email.com').id;
    await request.get(`/api/v1/organizations?ownerAgentId=${organizationOwnerAgentId}`).then((response) => {
      expect(response.status).toEqual(200);
      expect(response.body).toEqual({
        page: 1,
        pageSize: 10,
        nextPage: null,
        entities: [
          fakeOrganizationsByIdOrEmail.get('fake-organization-agent-child-01@email.com'),
          fakeOrganizationsByIdOrEmail.get('fake-organization-agent-child-02@email.com'),
        ],
      });
    });
  });
  it('[HTTP 404] should show error message when owner agent is not found', async () => {
    const nonExistingOwnerAgentId = randomBytes(14).toString('hex');
    await request.get(`/api/v1/organizations?ownerAgentId=${nonExistingOwnerAgentId}`).then((response) => {
      expect(response.status).toEqual(404);
      expect(response.body.message).toEqual(`Owner agent with id ${nonExistingOwnerAgentId} not found`);
    });
  });
  it.todo('[HTTP 401] should respond with error message when user is not authenticated');
  it.todo('[HTTP 403] should respond with error message when user is not authorized');
});
