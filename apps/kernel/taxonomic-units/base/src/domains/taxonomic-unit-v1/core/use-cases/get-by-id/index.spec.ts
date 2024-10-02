import { faker } from '@faker-js/faker';
import { GetTaxonomicUnitV1ByIdUseCase } from '.';
import { InMemoryTaxonomicUnitsV1Repository } from '../../../adapters/database-repository-in-memory';
import { TaxonomicUnitsV1DatabaseRepository } from '../../database-repository';

describe('GetTaxonomicUnitV1ByIdUseCase', () => {
  let taxonomicUnitsV1DatabaseRepository: TaxonomicUnitsV1DatabaseRepository;
  let getTaxonomicUnitV1ByIdUseCase: GetTaxonomicUnitV1ByIdUseCase;

  beforeEach(async () => {
    taxonomicUnitsV1DatabaseRepository = new InMemoryTaxonomicUnitsV1Repository();
    getTaxonomicUnitV1ByIdUseCase = new GetTaxonomicUnitV1ByIdUseCase(taxonomicUnitsV1DatabaseRepository);
  });

  it('should get entity by its id', async () => {
    const newEntityId = taxonomicUnitsV1DatabaseRepository.generateUniqueId();
    const expectedEntityDto = await taxonomicUnitsV1DatabaseRepository.create({
      id: newEntityId,
      version: 1,
      lineageIdPath: `/${newEntityId}`,
      schema: {
        properties: {
          parentId: {
            type: 'string',
          },
        },
        required: ['parentId'],
      },
      name: 'valid-taxonomic-unit-name',
    });

    const entityDtoById = await getTaxonomicUnitV1ByIdUseCase.execute(expectedEntityDto.id);
    expect(entityDtoById).toEqual(expectedEntityDto);
  });

  it('should throw not found error when entity does not exist', async () => {
    const nonExistingEntityId = faker.database.mongodbObjectId().toString();
    await expect(getTaxonomicUnitV1ByIdUseCase.execute(nonExistingEntityId)).rejects.toThrow(
      `Taxonomic Unit with id '${nonExistingEntityId}' not found`,
    );
  });
});
