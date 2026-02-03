import { MongoDbDriver } from '@peerlab/kernel/shared-ts-utils/drivers/mongodb-driver';
import { MongoDbMemoryServer } from '@peerlab/kernel/shared-ts-utils/drivers/mongodb-memory-server';
import { ConfigurationManager } from '@peerlab/kernel/taxonomic-units/base/config/configuration-management';
import { fakeTaxonomicUnitsV1 } from '@peerlab/kernel/taxonomic-units/base/domains/taxonomic-unit-v1/core/fixtures';
import supertest from 'supertest';
import { bootstrapApplication } from '../../../../app';
describe('GET /v1/taxonomic-units', () => {
  let request: supertest.SuperAgentTest;
  let configurationManager: ConfigurationManager;
  let databaseUri: string;
  let testMongoDbDriver: MongoDbDriver;
  const databaseName = 'test-taxonomic-units';
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
  it('[HTTP 200] should list all entities, with pagination', async () => {
    await request.get('/api/v1/taxonomic-units').then((response) => {
      expect(response.status).toEqual(200);
      expect(response.body).toEqual({
        page: 1,
        pageSize: 10,
        nextPage: null,
        entities: fakeTaxonomicUnitsV1,
      });
    });
    await request.get('/api/v1/taxonomic-units?page=1&limit=1').then((response) => {
      expect(response.status).toEqual(200);
      expect(response.body).toEqual({
        page: 1,
        pageSize: 1,
        nextPage: 2,
        entities: [fakeTaxonomicUnitsV1[0]],
      });
    });
  });
  it('[HTTP 200] should show empty results when there are no entities with the given pagination', async () => {
    await request.get(`/api/v1/taxonomic-units?page=2&limit=10`).then((response) => {
      expect(response.status).toEqual(200);
      expect(response.body).toEqual({
        page: 2,
        pageSize: 10,
        nextPage: null,
        entities: [],
      });
    });
  });
  it.todo('[HTTP 401] should respond with error message when user is not authenticated');
  it.todo('[HTTP 403] should respond with error message when user is not authorized');
});
