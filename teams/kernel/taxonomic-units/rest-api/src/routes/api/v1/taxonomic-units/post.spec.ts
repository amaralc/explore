import { faker } from '@faker-js/faker';
import { mongoDbIdFormat } from '@peerlab/kernel/shared-ts-utils/date-formats';
import { MongoDbDriver } from '@peerlab/kernel/shared-ts-utils/drivers/mongodb-driver';
import { MongoDbMemoryServer } from '@peerlab/kernel/shared-ts-utils/drivers/mongodb-memory-server';
import { ConfigurationManager } from '@peerlab/kernel/taxonomic-units/base/config/configuration-management';
import { ITaxonomicUnitV1 } from '@peerlab/kernel/taxonomic-units/base/domains/taxonomic-unit-v1/core/entity.schema.types';
import { fakeTaxonomicUnitsV1 } from '@peerlab/kernel/taxonomic-units/base/domains/taxonomic-unit-v1/core/fixtures';
import { ICreateFirstVersionOfTaxonomicUnitV1InputDto } from '@peerlab/kernel/taxonomic-units/base/domains/taxonomic-unit-v1/core/use-cases/create-first-version/input-dto.schema.types';
import supertest from 'supertest';
import { bootstrapApplication } from '../../../../app';

describe.skip('POST /v1/taxonomic-units', () => {
  let request: supertest.SuperAgentTest;
  let configurationManager: ConfigurationManager;
  let databaseUri: string;
  let testMongoDbDriver: MongoDbDriver;
  const databaseName = 'test-taxonomic-units';

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

  it('should create an entity using the REST API, responding with 201 HTTP status', async () => {
    const requestBody: ICreateFirstVersionOfTaxonomicUnitV1InputDto = {
      name: 'fake-name',
      parentId: null,
      metadataSchema: {
        type: 'object',
      },
      metadata: {},
      instanceSchema: {
        type: 'object',
        properties: {
          name: {
            type: 'string',
          },
          parentId: {
            type: 'string',
          },
        },
        required: ['name'],
      },
    };

    await request
      .post('/api/v1/taxonomic-units')
      .send(requestBody)
      .then((response) => {
        expect(response.status).toEqual(201);
        expect(response.body.id).toMatch(mongoDbIdFormat);

        const expectedResponseBody: ITaxonomicUnitV1 = {
          id: expect.stringMatching(mongoDbIdFormat),
          name: requestBody.name,
          instanceSchema: requestBody.instanceSchema,
          version: 1,
          lineageIdPath: `/${response.body.id}`,
          metadataSchema: {
            type: 'object',
          },
          metadata: {}
        };
        expect(response.body).toEqual(expectedResponseBody);
      });
  });

  it('should not create entity if a version already exists, responding with 409 HTTP status', async () => {
    const requestBody: ICreateFirstVersionOfTaxonomicUnitV1InputDto = {
      name: fakeTaxonomicUnitsV1[0].name,
      parentId: null,
      metadataSchema: {
        type: 'object',
      },
      metadata: {},
      instanceSchema: {
        type: 'object',
        properties: {
          name: {
            type: 'string',
          },
          parentId: {
            type: 'string',
          },
        },
        required: ['name'],
      },
    };

    await request
      .post('/api/v1/taxonomic-units')
      .send(requestBody)
      .then((response) => {
        expect(response.status).toEqual(409);
      });
  });

  it('should throw a 404 error if parent taxonomic unit does not exist', async () => {
    const requestBody = {
      name: 'fake-name',
      parentId: faker.database.mongodbObjectId().toString(),
      instanceSchema: {
        type: 'object',
        properties: {
          name: {
            type: 'string',
          },
          parentId: {
            type: 'string',
          },
        },
        required: ['name'],
      },
    };
    await request
      .post(`/api/v1/taxonomic-units`)
      .send(requestBody)
      .then((response) => {
        expect(response.status).toEqual(404);
        expect(response.body.message).toEqual(`Parent taxonomic unit with id '${requestBody.parentId}' was not found`);
      });
  });

  it.todo('should not allow unauthorized requests, responding with 401 HTTP status');
  it.todo('should not allow unauthenticated requests, responding with 403 HTTP status');
});
