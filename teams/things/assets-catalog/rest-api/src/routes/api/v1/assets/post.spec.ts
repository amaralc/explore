import { iso8601DateFormat, mongoDbIdFormat } from '@peerlab/kernel/shared-ts-utils/date-formats';
import { MongoDbDriver } from '@peerlab/kernel/shared-ts-utils/drivers/mongodb-driver';
import { MongoDbMemoryServer } from '@peerlab/kernel/shared-ts-utils/drivers/mongodb-memory-server';
import { ConfigurationManager } from '@peerlab/things/assets-catalog/base/config/configuration-manager';
import { defaultConfiguration } from '@peerlab/things/assets-catalog/base/config/default-configuration';
import { IAssetV1Dto } from '@peerlab/things/assets-catalog/base/domains/assets-v1/core/entity';
import { CreateAssetV1InputDto } from '@peerlab/things/assets-catalog/base/domains/assets-v1/core/use-cases/create-asset';
import { fakeTaxonomicUnitsV1 } from '@peerlab/things/assets-catalog/base/domains/taxonomic-units-v1/core/fixtures';
import supertest from 'supertest';
import { bootstrapApplication } from '../../../../app';
const existingTaxonomicUnit = fakeTaxonomicUnitsV1[0];
describe('POST /v1/assets', () => {
  let request: supertest.SuperAgentTest;
  let configurationManager: ConfigurationManager;
  let databaseUri: string;
  let mongoDbMemoryServer: MongoDbMemoryServer;
  let testDatabaseDriver: MongoDbDriver;
  beforeAll(async () => {
    configurationManager = new ConfigurationManager(defaultConfiguration);
    const result = await MongoDbMemoryServer.initializeInMemoryDatabase();
    databaseUri = databaseUri = result.databaseUri;
    mongoDbMemoryServer = result.mongoMemoryServer;
    testDatabaseDriver = new MongoDbDriver(databaseUri);
    await testDatabaseDriver.connectToDatabase(configurationManager.getConfig().database.name);
    // Override the default configuration with in memory database configuration
    configurationManager.setConfig({
      ...configurationManager.getConfig(),
      database: {
        ...configurationManager.getConfig().database,
        uri: databaseUri,
        seed: 'true',
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
  it('should create a new asset', async () => {
    const existingTaxonomicUnitSlug = existingTaxonomicUnit.slug; // Fake taxonomic unit slug
    const requestBody: CreateAssetV1InputDto = {
      name: 'Fake Asset Name',
      taxonomicUnitSlug: existingTaxonomicUnitSlug,
      tags: ['fake-tag'],
    };
    const expectedResponseBody: IAssetV1Dto = {
      id: expect.stringMatching(mongoDbIdFormat),
      name: requestBody.name,
      tags: requestBody.tags,
      taxonomicUnitSlug: requestBody.taxonomicUnitSlug,
      createdAt: expect.stringMatching(iso8601DateFormat),
      updatedAt: expect.stringMatching(iso8601DateFormat),
    };
    await request
      .post('/api/v1/assets')
      .send(requestBody)
      .then((response) => {
        expect(response.status).toEqual(201);
        expect(response.body).toEqual(expectedResponseBody);
      });
  });
  it('should return bad request error if request is malformed', async () => {
    const invalidAssetName = ''; // Slug with less than 3 characters
    const existingTaxonomicUnitSlug = fakeTaxonomicUnitsV1[0].slug; // Fake taxonomic unit slug
    const invalidRequestBody1: CreateAssetV1InputDto = {
      name: invalidAssetName,
      taxonomicUnitSlug: existingTaxonomicUnitSlug,
      tags: ['valid-fake-tag'],
    };
    await request
      .post('/api/v1/assets')
      .send(invalidRequestBody1)
      .then((response) => {
        expect(response.status).toEqual(400);
        expect(response.body.message).toEqual('Validation exception');
        expect(response.body.causes).toEqual(expect.arrayContaining([expect.stringContaining('/name')]));
      });
    const invalidRequestBody2: CreateAssetV1InputDto = {
      name: 'Valid Asset Name',
      taxonomicUnitSlug: existingTaxonomicUnitSlug,
      tags: ['.invalid.tag'],
    };
    await request
      .post('/api/v1/assets')
      .send(invalidRequestBody2)
      .then((response) => {
        expect(response.status).toEqual(400);
        expect(response.body.message).toEqual('Validation exception');
        expect(response.body.causes).toEqual(expect.arrayContaining([expect.stringContaining('/tags')]));
      });
  });
});
