import { iso8601DateFormat, mongoDbIdFormat } from '@peerlab/kernel/shared-ts-utils/date-formats';
import { MongoDbDriver } from '@peerlab/kernel/shared-ts-utils/drivers/mongodb-driver';
import { MongoDbMemoryServer } from '@peerlab/kernel/shared-ts-utils/drivers/mongodb-memory-server';
import { NativeLogger } from '@peerlab/kernel/shared-ts-utils/logs/native-logger';
import { ConfigurationManager } from '@peerlab/things/assets-catalog/base/config/configuration-manager';
import { defaultConfiguration } from '@peerlab/things/assets-catalog/base/config/default-configuration';
import { ITaxonomicUnitV1Dto } from '@peerlab/things/assets-catalog/base/domains/taxonomic-units-v1/core/entity';
import { CreateTaxonomicUnitV1InputDto } from '@peerlab/things/assets-catalog/base/domains/taxonomic-units-v1/core/use-cases/create-taxonomic-unit';
import supertest from 'supertest';
import { bootstrapApplication } from '../../../../app';

describe('POST /v1/taxonomic-units', () => {
  let request: supertest.SuperAgentTest;
  let configurationManager: ConfigurationManager;
  let databaseUri: string;
  let mongoDbMemoryServer: MongoDbMemoryServer;
  let testDatabaseDriver: MongoDbDriver;

  beforeAll(async () => {
    const logger = new NativeLogger();
    configurationManager = new ConfigurationManager(defaultConfiguration, logger);
    const result = await MongoDbMemoryServer.initializeInMemoryDatabase();
    databaseUri = result.databaseUri;
    mongoDbMemoryServer = result.mongoMemoryServer;

    testDatabaseDriver = new MongoDbDriver(databaseUri);
    await testDatabaseDriver.connectToDatabase(configurationManager.getConfig().database.name);

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
    await testDatabaseDriver.client.db(configurationManager.getConfig().database.name).dropDatabase();
    const { app } = await bootstrapApplication(configurationManager);
    request = supertest.agent(app);
  });

  afterAll(async () => {
    await mongoDbMemoryServer.stop();
  });

  it('should create a taxonomic unit', async () => {
    const requestBody: CreateTaxonomicUnitV1InputDto = {
      slug: 'fake-taxonomic-unit',
    };

    const expectedResponseBody: ITaxonomicUnitV1Dto = {
      id: expect.stringMatching(mongoDbIdFormat),
      slug: requestBody.slug,
      createdAt: expect.stringMatching(iso8601DateFormat),
      updatedAt: expect.stringMatching(iso8601DateFormat),
    };

    await request
      .post('/api/v1/taxonomic-units')
      .send(requestBody)
      .then((response) => {
        expect(response.status).toEqual(201);
        expect(response.body).toEqual(expectedResponseBody);
      });
  });

  it('should return bad request error if request is malformed', async () => {
    const invalidSlug = 'a'; // Slug with less than 3 characters
    const requestBody: CreateTaxonomicUnitV1InputDto = {
      slug: invalidSlug,
    };

    await request
      .post('/api/v1/taxonomic-units')
      .send(requestBody)
      .then((response) => {
        expect(response.status).toEqual(400);
        expect(response.body.message).toEqual('Validation exception');
        expect(response.body.causes).toEqual(expect.arrayContaining([expect.stringContaining('/slug')]));
      });
  });
});
