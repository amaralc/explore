import { mongoDbIdFormat } from '@peerlab/kernel/shared-ts-utils/date-formats';
import { MongoDbDriver } from '@peerlab/kernel/shared-ts-utils/drivers/mongodb-driver';
import { MongoDbMemoryServer } from '@peerlab/kernel/shared-ts-utils/drivers/mongodb-memory-server';
import { ConfigurationManager } from '@peerlab/kernel/taxonomic-units/base/config/configuration-management';
import { ITaxonomicUnitInstanceV1 } from '@peerlab/kernel/taxonomic-units/base/domains/taxonomic-unit-instance-v1/core/entity.schema.types';
import { ObjectId } from 'mongodb';
import supertest from 'supertest';
import { bootstrapApplication } from '../../../../../../app';

describe('POST /api/v1/taxonomic-units/-/instances', () => {
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
  it('[HTTP 404] should throw a 404 error if the taxonomic unit does not exist', async () => {
    const requestBody = {
      schema: {
        version: 1,
        name: 'non-existing-taxonomic-unit',
      },
      data: {
        name: 'fake-name-01',
      },
    };

    await request
      .post(`/api/v1/taxonomic-units/-/instances`)
      .send(requestBody)
      .then((response) => {
        expect(response.status).toEqual(404);
        expect(response.body.message).toEqual(
          `Taxonomic unit with name ${requestBody.schema.name} and version ${requestBody.schema.version} was not found`,
        );
      });
  });

  it.each([
    {
      name: 'fake-name-01',
    },
    {
      parentId: 1,
    },
    {
      parentId: null,
    },
    {
      parentId: undefined,
    },
  ])(
    '[HTTP 400] should prevent the creation of a new taxonomic unit instance if data does not conform to version and schema',
    async (requestBodyData) => {
      const requestBody = {
        schema: {
          version: 1,
          name: 'fake-taxonomic-unit-01', // Existing taxonomic unit created before tests from fixture files
        },
        data: requestBodyData,
      };

      await request
        .post(`/api/v1/taxonomic-units/-/instances`)
        .send(requestBody)
        .then((response) => {
          expect(response.status).toEqual(400);
          expect(response.body.message).toEqual('Validation exception');
        });
    },
  );

  it.each([
    {
      parentId: 'fake-parent-id',
    },
  ])(
    '[HTTP 201] should create a new taxonomic unit instance if data conforms to version and schema',
    async (requestBodyData) => {
      const requestBody = {
        schema: {
          version: 1,
          name: 'fake-taxonomic-unit-01', // Existing taxonomic unit created before tests from fixture files
        },
        data: requestBodyData,
      };

      await request
        .post(`/api/v1/taxonomic-units/-/instances`)
        .send(requestBody)
        .then(async (response) => {
          expect(response.status).toEqual(201);
          expect(response.body).toEqual({
            id: expect.stringMatching(mongoDbIdFormat),
            schema: {
              name: requestBody.schema.name,
              version: requestBody.schema.version,
            },
            data: {
              parentId: requestBody.data.parentId,
            },
          });

          const collection = testMongoDbDriver.getCollection<ITaxonomicUnitInstanceV1>('TaxonomicUnitInstanceV1');
          const document = await collection.findOne({ _id: new ObjectId(response.body.id as string) });
          expect(document).not.toBeNull();

          const entityDto = {
            schema: document.schema,
            data: document.data,
            id: document._id.toString(),
          };
          expect(entityDto).toEqual({
            id: expect.stringMatching(mongoDbIdFormat),
            schema: { name: requestBody.schema.name, version: requestBody.schema.version },
            data: { parentId: requestBody.data.parentId },
          });
        });
    },
  );
});
