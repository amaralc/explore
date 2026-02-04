import { MongoDbMemoryServer } from '@peerlab/kernel/shared-ts-utils/drivers/mongodb-memory-server';
import { ConfigurationManager } from '@peerlab/people/organizations-management/base/config/configuration-management';
import { fakeAgentsByIdOrEmail } from '@peerlab/people/organizations-management/base/domains/agents-v1/core/fixtures';
import supertest from 'supertest';
import { bootstrapApplication } from '../../../../app';
import { ISeedOrganizationsFromExternalSourceInputDto } from './post.types';
describe('POST /v1/organizations:seed', () => {
  let request: supertest.SuperAgentTest;
  let configurationManager: ConfigurationManager;
  let databaseUri: string;
  const databaseName = 'test-database';
  beforeAll(async () => {
    configurationManager = new ConfigurationManager();
    const result = await MongoDbMemoryServer.initializeInMemoryDatabase();
    databaseUri = result.databaseUri;
    // Override the default configuration with in memory database configuration
    configurationManager.setConfig({
      ...configurationManager.getConfig(),
      database: {
        ...configurationManager.getConfig().database,
        name: databaseName,
        uri: databaseUri,
      },
    });
  });
  afterEach(async () => {
    await configurationManager.databaseDriver.dropDatabase(databaseName);
  });
  beforeEach(async () => {
    const { app } = await bootstrapApplication(configurationManager);
    request = supertest.agent(app);
  });
  it.each([
    { sourceName: 'invalid-source-name', agentAccountHolderId: 'invalid-account-holder-id' },
    { sourceName: 'USP_MULTI', agentAccountHolderId: 'invalid-account-id' },
    {
      sourceName: 'invalid-source-name',
      agentAccountHolderId: fakeAgentsByIdOrEmail.get('fake-agent-owner-of-free-organization@email.com').id,
    },
  ])('should throw validation exception for invalid request body', async (requestBody) => {
    await request
      .post('/api/v1/organizations:seed')
      .send(requestBody)
      .then((response) => {
        expect(response.status).toEqual(400);
      });
  });
  it('should throw not found error for non-existent account holders', async () => {
    const agentsV1Repository = (await configurationManager.getRepositories()).agentsV1;
    const nonExistentAccountId = agentsV1Repository.generateUniqueId();
    const requestBody: ISeedOrganizationsFromExternalSourceInputDto = {
      sourceName: 'USP_MULTI',
      agentAccountHolderId: nonExistentAccountId,
    };
    await request
      .post('/api/v1/organizations:seed')
      .send(requestBody)
      .then((response) => {
        expect(response.status).toEqual(404);
      });
  });
  it('should extract and store organizations from external source', async () => {
    const accountHolder = fakeAgentsByIdOrEmail.get('fake-agent-owner-of-free-organization@email.com');
    const requestBody: ISeedOrganizationsFromExternalSourceInputDto = {
      sourceName: 'USP_MULTI',
      agentAccountHolderId: accountHolder.id,
    };
    await request
      .post('/api/v1/organizations:seed')
      .send(requestBody)
      .then((response) => {
        expect(response.status).toEqual(201);
        expect(response.body).toEqual({
          extractedCentralsCount: 3,
          extractedDepartmentsCount: 2,
          extractedInstitutionsCount: 3,
          extractedUnitsCount: 2,
        });
      });
  });
  it.only('should update entities in dataset if they already exist', async () => {
    const accountHolder = fakeAgentsByIdOrEmail.get('fake-agent-owner-of-free-organization@email.com');
    const requestBody: ISeedOrganizationsFromExternalSourceInputDto = {
      sourceName: 'USP_MULTI',
      agentAccountHolderId: accountHolder.id,
    };
    await request
      .post('/api/v1/organizations:seed')
      .send(requestBody)
      .then((response) => {
        expect(response.status).toEqual(201);
        expect(response.body).toEqual({
          extractedCentralsCount: 3,
          extractedDepartmentsCount: 2,
          extractedInstitutionsCount: 3,
          extractedUnitsCount: 2,
        });
      });
    await request
      .post('/api/v1/organizations:seed')
      .send(requestBody)
      .then((response) => {
        expect(response.status).toEqual(201);
        expect(response.body).toEqual({
          extractedCentralsCount: 3,
          extractedDepartmentsCount: 2,
          extractedInstitutionsCount: 3,
          extractedUnitsCount: 2,
        });
      });
  });
});
