import { MongoDbDriver } from '@peerlab/kernel/shared-ts-utils/drivers/mongodb-driver';
import { MongoDbMemoryServer } from '@peerlab/kernel/shared-ts-utils/drivers/mongodb-memory-server';
import { ExtractEntitiesFromExternalSourceUseCase } from '.';
import { MongoDbAgentsV1DatabaseRepository } from '../../../../agents-v1/adapters/database-repository-mongodb';
import { AgentsV1DatabaseRepository } from '../../../../agents-v1/core/database-repository';
import { IAgentV1Dto } from '../../../../agents-v1/core/entity.schema.types';
import { FileSystemMultiCentralsV1Repository } from '../../../../multi-central-v1/adapters/database-repository-multi-file-system';
import { MultiCentralsV1DatabaseRepository } from '../../../../multi-central-v1/core/database-repository';
import { FileSystemMultiInstitutionsV1Repository } from '../../../../multi-institution-v1/adapters/database-repository-multi-file-system';
import { MultiInstitutionsV1DatabaseRepository } from '../../../../multi-institution-v1/core/database-repository';
import { MongoDbOrganizationsV1Repository } from '../../../../taxonomic-unit-v1/adapters/database-repository-mongodb';
import { OrganizationsV1DatabaseRepository } from '../../../../taxonomic-unit-v1/core/database-repository';

describe('ExtractEntitiesFromExternalSourceUseCase', () => {
  let extractEntitiesFromExternalSourceUseCase: ExtractEntitiesFromExternalSourceUseCase;
  let multiInstitutionsV1DatabaseRepository: MultiInstitutionsV1DatabaseRepository;
  let multiCentralsV1DatabaseRepository: MultiCentralsV1DatabaseRepository;
  let agentsV1DatabaseRepository: AgentsV1DatabaseRepository;
  let organizationsV1DatabaseRepository: OrganizationsV1DatabaseRepository;

  const databaseName = 'test-database';
  let mongoDbMemoryServer: MongoDbMemoryServer;
  let mongoDbDriver: MongoDbDriver;

  let fakeAccountHolderAgent: null | IAgentV1Dto = null;

  beforeAll(async () => {
    const result = await MongoDbMemoryServer.initializeInMemoryDatabase();
    mongoDbMemoryServer = result.mongoMemoryServer;
    mongoDbDriver = new MongoDbDriver(result.databaseUri);
    await mongoDbDriver.connectToDatabase(databaseName);
  });

  beforeEach(async () => {
    // Given
    await mongoDbDriver.dropDatabase(databaseName);
    agentsV1DatabaseRepository = new MongoDbAgentsV1DatabaseRepository(mongoDbDriver);

    const createdAt = new Date().toISOString();
    fakeAccountHolderAgent = await agentsV1DatabaseRepository.create({
      nickname: 'fake-account-holder',
      createdAt,
      updatedAt: createdAt,
      email: 'fake-account-holder@email.com',
      id: agentsV1DatabaseRepository.generateUniqueId(),
      type: 'ORGANIZATION',
    });

    organizationsV1DatabaseRepository = new MongoDbOrganizationsV1Repository(mongoDbDriver);
    multiInstitutionsV1DatabaseRepository = new FileSystemMultiInstitutionsV1Repository();
    multiCentralsV1DatabaseRepository = new FileSystemMultiCentralsV1Repository();
    extractEntitiesFromExternalSourceUseCase = new ExtractEntitiesFromExternalSourceUseCase(
      multiInstitutionsV1DatabaseRepository,
      multiCentralsV1DatabaseRepository,
      agentsV1DatabaseRepository,
      organizationsV1DatabaseRepository,
    );
  });

  afterAll(async () => {
    await mongoDbDriver.disconnect();
    await mongoDbMemoryServer.stop();
  });

  it('should create the same number of agents-v1 and organizations-v1', async () => {
    // When
    const { extractedCentralsCount, extractedDepartmentsCount, extractedInstitutionsCount, extractedUnitsCount } =
      await extractEntitiesFromExternalSourceUseCase.execute(fakeAccountHolderAgent.id);

    // Then
    const agentsCount = await agentsV1DatabaseRepository.countAll();
    const agentsCountExceptAccountHolder = agentsCount - 1;
    expect(agentsCountExceptAccountHolder).toEqual(
      extractedCentralsCount + extractedDepartmentsCount + extractedInstitutionsCount + extractedUnitsCount,
    );

    const organizationsCount = await organizationsV1DatabaseRepository.countAll();
    expect(organizationsCount).toEqual(
      extractedCentralsCount + extractedDepartmentsCount + extractedInstitutionsCount + extractedUnitsCount,
    );
  });

  it('should create the correct agent-v1 per organization-v1', async () => {
    // When
    await extractEntitiesFromExternalSourceUseCase.execute(fakeAccountHolderAgent.id);

    // Then
    const paginatedOrganizations = await organizationsV1DatabaseRepository.listPaginated({ limit: 20, page: 1 });
    for (const organization of paginatedOrganizations.entities) {
      const organizationAgentV1Dto = await agentsV1DatabaseRepository.getAgentById(organization.agentId);
      const organizationNicknamePrefix = organization.nickname.split('-')[0];
      const agentNicknamePrefix = organizationAgentV1Dto.nickname.split('-')[0];
      expect(agentNicknamePrefix).toEqual(organizationNicknamePrefix);
    }
  });

  it('should update entities in dataset if they already exist', async () => {
    // When (use case executed twice, with different source values)
    const firstExtractionResult = await extractEntitiesFromExternalSourceUseCase.execute(fakeAccountHolderAgent.id);
    expect(firstExtractionResult).toEqual({
      extractedCentralsCount: 3,
      extractedDepartmentsCount: 2,
      extractedInstitutionsCount: 3,
      extractedUnitsCount: 2,
    });

    const multiInstitutionsV1UpdatedDatabaseRepository = new FileSystemMultiInstitutionsV1Repository(
      'apps/kernel/taxonomic-units/base/src/domains/_shared/core/use-cases/extract-entities-from-external-source/fixtures/multi-institutions-v1-updated-response-body.json',
    );
    const multiCentralsV1UpdatedDatabaseRepository = new FileSystemMultiCentralsV1Repository(
      'apps/kernel/taxonomic-units/base/src/domains/_shared/core/use-cases/extract-entities-from-external-source/fixtures/multi-centrals-v1-updated-response-body.json',
    );
    const extractEntitiesFromExternalSourceUpdatedUseCase = new ExtractEntitiesFromExternalSourceUseCase(
      multiInstitutionsV1UpdatedDatabaseRepository,
      multiCentralsV1UpdatedDatabaseRepository,
      agentsV1DatabaseRepository,
      organizationsV1DatabaseRepository,
    );
    const secondExtractionResult = await extractEntitiesFromExternalSourceUpdatedUseCase.execute(
      fakeAccountHolderAgent.id,
    );

    // Then
    expect(secondExtractionResult).toEqual({
      extractedCentralsCount: 4,
      extractedDepartmentsCount: 3,
      extractedInstitutionsCount: 4,
      extractedUnitsCount: 3,
    });
    const paginatedOrganizations = await organizationsV1DatabaseRepository.listPaginated({ limit: 20, page: 1 });
    for (const organization of paginatedOrganizations.entities) {
      const organizationAgentV1Dto = await agentsV1DatabaseRepository.getAgentById(organization.agentId);
      const organizationNicknamePrefix = organization.nickname.split('-')[0];
      const agentNicknamePrefix = organizationAgentV1Dto.nickname.split('-')[0];
      expect(agentNicknamePrefix).toEqual(organizationNicknamePrefix);
    }
  });

  it('should populate organizations with parent-child relationship', async () => {
    // Given

    // When
    await extractEntitiesFromExternalSourceUseCase.execute(fakeAccountHolderAgent.id);
    const idPathRegex = /^\/([0-9a-fA-F]{24})(?:\/([0-9a-fA-F]{24}))*$/;

    // Then
    const paginatedOrganizations = await organizationsV1DatabaseRepository.listPaginated({ limit: 20, page: 1 });
    for (const organization of paginatedOrganizations.entities) {
      expect(organization.idPath).toMatch(idPathRegex);
    }
  });
});
