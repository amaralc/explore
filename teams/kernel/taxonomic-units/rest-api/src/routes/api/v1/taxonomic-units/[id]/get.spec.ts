import { MongoDbMemoryServer } from '@peerlab/kernel/shared-ts-utils/drivers/mongodb-memory-server';
import { ConfigurationManager } from '@peerlab/kernel/taxonomic-units/base/config/configuration-management';
import { fakeTaxonomicUnitsV1 } from '@peerlab/kernel/taxonomic-units/base/domains/taxonomic-unit-v1/core/fixtures';
import supertest from 'supertest';
import { bootstrapApplication } from '../../../../../app';

describe('GET /api/v1/taxonomic-units/{id}', () => {
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
    const existingTaxonomicUnitV1 = fakeTaxonomicUnitsV1[0];

    await request.get(`/api/v1/taxonomic-units/${existingTaxonomicUnitV1.id}`).then((response) => {
      expect(response.status).toEqual(200);
      expect(response.body).toEqual(existingTaxonomicUnitV1);
    });
  });
});
