import { iso8601DateFormat, mongoDbIdFormat } from '@peerlab/kernel/shared-ts-utils/date-formats';
import { MongoDbDriver } from '@peerlab/kernel/shared-ts-utils/drivers/mongodb-driver';
import { MongoDbMemoryServer } from '@peerlab/kernel/shared-ts-utils/drivers/mongodb-memory-server';
import { CreateTaxonomicUnitV1UseCase } from '.';
import { MongoDbTaxonomicUnitsV1DatabaseRepository } from '../../../adapters/database-repository-mongodb';
import { ITaxonomicUnitV1Dto } from '../../entity.schema.types';
import { TaxonomicUnitsV1DatabaseRepository } from '../../repository-database';
import { TaxonomicUnitAlreadyExistsError } from './errors';
import { ICreateTaxonomicUnitV1InputDto } from './input-dto.schema.types';

describe('Create TaxonomicUnitV1 with free plan subscription', () => {
  let taxonomicUnitsV1DatabaseRepository: TaxonomicUnitsV1DatabaseRepository;
  let createOrganizationUseCase: CreateTaxonomicUnitV1UseCase;
  let mongoDbMemoryServer: MongoDbMemoryServer;
  let mongoDbDriver: MongoDbDriver;

  beforeAll(async () => {
    const result = await MongoDbMemoryServer.initializeInMemoryDatabase();
    mongoDbMemoryServer = result.mongoMemoryServer;
    mongoDbDriver = new MongoDbDriver(result.databaseUri);
    await mongoDbDriver.connectToDatabase('test-database');
  });

  beforeEach(async () => {
    taxonomicUnitsV1DatabaseRepository = new MongoDbTaxonomicUnitsV1DatabaseRepository(mongoDbDriver);
    await taxonomicUnitsV1DatabaseRepository.generateIndexes();

    createOrganizationUseCase = new CreateTaxonomicUnitV1UseCase(taxonomicUnitsV1DatabaseRepository);
  });

  afterEach(async () => {
    await taxonomicUnitsV1DatabaseRepository.deleteAll();
  });

  afterAll(async () => {
    await mongoDbDriver.disconnect();
    await mongoDbMemoryServer.stop();
  });

  it('should create a taxonomic unit', async () => {
    const createOrganizationInputDto: ICreateTaxonomicUnitV1InputDto = {
      slug: 'valid-taxonomic-unit-slug',
    };

    const expectedTaxonomicUnitV1: ITaxonomicUnitV1Dto = {
      id: expect.stringMatching(mongoDbIdFormat),
      slug: createOrganizationInputDto.slug,
      createdAt: expect.stringMatching(iso8601DateFormat),
      updatedAt: expect.stringMatching(iso8601DateFormat),
    };

    const createdOrganization = await createOrganizationUseCase.execute(createOrganizationInputDto);
    expect(createdOrganization).toEqual(expectedTaxonomicUnitV1);
  });

  it('should not allow creating two taxonomic units with the same slug', async () => {
    const createOrganizationInputDto: ICreateTaxonomicUnitV1InputDto = {
      slug: 'valid-taxonomic-unit-slug',
    };

    const duplicatedNicknameOrganizationInputDto: ICreateTaxonomicUnitV1InputDto = {
      slug: createOrganizationInputDto.slug,
    };

    await createOrganizationUseCase.execute(createOrganizationInputDto);
    await expect(createOrganizationUseCase.execute(duplicatedNicknameOrganizationInputDto)).rejects.toThrow(
      TaxonomicUnitAlreadyExistsError,
    );
  });
});
