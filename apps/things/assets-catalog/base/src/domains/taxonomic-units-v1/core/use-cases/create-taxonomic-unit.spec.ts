import { iso8601DateFormat, mongoDbIdFormat } from '@peerlab/kernel/shared-ts-utils/date-formats';
import { ApplicationLogger } from '@peerlab/kernel/shared-ts-utils/logs/application-logger';
import { NativeLogger } from '@peerlab/kernel/shared-ts-utils/logs/native-logger';
import { ITaxonomicUnitV1Dto } from '../entity';
import { TaxonomicUnitsV1DatabaseRepository } from '../repository-database';
import { InMemoryTaxonomicUnitsV1DatabaseRepository } from '../repository-database-in-memory';
import { CreateTaxonomicUnitV1InputDto, CreateTaxonomicUnitV1UseCase } from './create-taxonomic-unit';

describe('Create TaxonomicUnitV1 with free plan subscription', () => {
  let taxonomicUnitsV1DatabaseRepository: TaxonomicUnitsV1DatabaseRepository;
  let createOrganizationUseCase: CreateTaxonomicUnitV1UseCase;
  let logger: ApplicationLogger;

  beforeEach(async () => {
    logger = new NativeLogger();
    taxonomicUnitsV1DatabaseRepository = new InMemoryTaxonomicUnitsV1DatabaseRepository();
    createOrganizationUseCase = new CreateTaxonomicUnitV1UseCase(taxonomicUnitsV1DatabaseRepository, logger);
  });

  it('should create a taxonomic unit', async () => {
    const createOrganizationInputDto: CreateTaxonomicUnitV1InputDto = {
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
    const createOrganizationInputDto: CreateTaxonomicUnitV1InputDto = {
      slug: 'valid-taxonomic-unit-slug',
    };

    const duplicatedNicknameOrganizationInputDto: CreateTaxonomicUnitV1InputDto = {
      slug: createOrganizationInputDto.slug,
    };

    await createOrganizationUseCase.execute(createOrganizationInputDto);
    await expect(createOrganizationUseCase.execute(duplicatedNicknameOrganizationInputDto)).rejects.toThrow(
      'Taxonomic unit with same slug already exist',
    );
  });
});
