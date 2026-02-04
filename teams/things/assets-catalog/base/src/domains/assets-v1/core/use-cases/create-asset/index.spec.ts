import { faker } from '@faker-js/faker';
import { iso8601DateFormat, mongoDbIdFormat } from '@peerlab/kernel/shared-ts-utils/date-formats';
import { ValidationExceptionV2Error } from '@peerlab/kernel/shared-ts-utils/errors/validation-exception-v1';
import { CreateAssetV1UseCase } from '.';
import { TaxonomicUnitV1NotFoundError } from '../../../../taxonomic-units-v1/core/errors';
import { TaxonomicUnitsV1DatabaseRepository } from '../../../../taxonomic-units-v1/core/repository-database';
import { InMemoryTaxonomicUnitsV1DatabaseRepository } from '../../../../taxonomic-units-v1/core/repository-database-in-memory';
import { IAssetV1Dto } from '../../entity.schema.types';
import { AssetsV1DatabaseRepository } from '../../repository-database';
import { InMemoryAssetsV1DatabaseRepository } from '../../repository-database-in-memory';
import { ICreateAssetV1InputDto } from './input-dto.schema.types';
describe('CreateAssetV1UseCase', () => {
  let assetsV1DatabaseRepository: AssetsV1DatabaseRepository;
  let taxonomicUnitsV1DatabaseRepository: TaxonomicUnitsV1DatabaseRepository;
  let createOrganizationUseCase: CreateAssetV1UseCase;
  beforeEach(async () => {
    assetsV1DatabaseRepository = new InMemoryAssetsV1DatabaseRepository();
    taxonomicUnitsV1DatabaseRepository = new InMemoryTaxonomicUnitsV1DatabaseRepository();
    createOrganizationUseCase = new CreateAssetV1UseCase(
      assetsV1DatabaseRepository,
      taxonomicUnitsV1DatabaseRepository,
    );
  });
  it('should not create asset associated to a nonexisting taxonomic unit', async () => {
    const nonExistingTaxonomicUnitSlug = 'nonexistent-taxonomic-unit-slug';
    const createAssetV1InputDto: ICreateAssetV1InputDto = {
      taxonomicUnitSlug: nonExistingTaxonomicUnitSlug,
      name: 'Valid Asset Name',
      tags: ['valid-fake-tag'],
    };
    expect(async () => {
      await createOrganizationUseCase.execute(createAssetV1InputDto);
    }).rejects.toThrow(TaxonomicUnitV1NotFoundError);
  });
  it('should not create asset with invalid tags', async () => {
    const validTaxonomicUnitSlug = 'valid-taxonomic-unit-slug';
    await taxonomicUnitsV1DatabaseRepository.create({
      id: faker.database.mongodbObjectId().toString(),
      slug: validTaxonomicUnitSlug,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    const createAssetV1InputDto: ICreateAssetV1InputDto = {
      taxonomicUnitSlug: validTaxonomicUnitSlug,
      name: 'Valid Asset Name',
      tags: ['1.invalid.tag'],
    };
    expect(async () => {
      await createOrganizationUseCase.execute(createAssetV1InputDto);
    }).rejects.toThrow(ValidationExceptionV2Error);
  });
  it.each([1, [], '', {}])('should not create asset with invalid name', async (invalidAssetName) => {
    const validTaxonomicUnitSlug = 'valid-taxonomic-unit-slug';
    await taxonomicUnitsV1DatabaseRepository.create({
      id: faker.database.mongodbObjectId().toString(),
      slug: validTaxonomicUnitSlug,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    const createAssetV1InputDto: ICreateAssetV1InputDto = {
      taxonomicUnitSlug: validTaxonomicUnitSlug,
      name: invalidAssetName as unknown as string, // should fail
      tags: ['valid-fake-tag'],
    };
    expect(async () => {
      await createOrganizationUseCase.execute(createAssetV1InputDto);
    }).rejects.toThrow(ValidationExceptionV2Error);
  });
  it('should create a new asset', async () => {
    const taxonomicUnitSlug = 'valid-taxonomic-unit-slug';
    await taxonomicUnitsV1DatabaseRepository.create({
      id: faker.database.mongodbObjectId().toString(),
      slug: taxonomicUnitSlug,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    const createAssetV1InputDto: ICreateAssetV1InputDto = {
      taxonomicUnitSlug,
      name: 'Valid Asset Name',
      tags: ['valid-fake-tag'],
    };
    const createdAssetV1 = await createOrganizationUseCase.execute(createAssetV1InputDto);
    const expectedAssetV1: IAssetV1Dto = {
      id: expect.stringMatching(mongoDbIdFormat),
      name: createAssetV1InputDto.name,
      tags: createAssetV1InputDto.tags,
      taxonomicUnitSlug,
      createdAt: expect.stringMatching(iso8601DateFormat),
      updatedAt: expect.stringMatching(iso8601DateFormat),
    };
    expect(createdAssetV1).toEqual(expectedAssetV1);
  });
});
