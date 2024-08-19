import { mongoDbIdFormat } from '@peerlab/kernel/shared-ts-utils/date-formats';
import { CreateFirstVersionOfTaxonomicUnitV1UseCase } from '.';
import { InMemoryTaxonomicUnitsV1Repository } from '../../../adapters/database-repository-in-memory';
import { TaxonomicUnitsV1DatabaseRepository } from '../../database-repository';
import { ITaxonomicUnitV1 } from '../../entity.schema.types';
import { ICreateFirstVersionOfTaxonomicUnitV1InputDto } from './input-dto.schema.types';

describe('CreateFirstVersionOfTaxonomicUnitV1UseCase', () => {
  let entityDtoDatabaseRepository: TaxonomicUnitsV1DatabaseRepository;
  let useCase: CreateFirstVersionOfTaxonomicUnitV1UseCase;

  beforeEach(async () => {
    entityDtoDatabaseRepository = new InMemoryTaxonomicUnitsV1Repository();
    useCase = new CreateFirstVersionOfTaxonomicUnitV1UseCase(entityDtoDatabaseRepository);
  });

  it('should create and persist a valid entity', async () => {
    const createEntityInputDto: ICreateFirstVersionOfTaxonomicUnitV1InputDto = {
      name: 'valid-taxonomic-unit-name',
      schema: {
        properties: {
          parentId: {
            type: 'string',
          },
        },
        required: ['parentId'],
      },
    };

    const expectedCreatedEntity: ITaxonomicUnitV1 = {
      id: expect.stringMatching(mongoDbIdFormat),
      version: 1,
      schema: {
        properties: {
          parentId: {
            type: 'string',
          },
        },
        required: ['parentId'],
      },
      name: createEntityInputDto.name,
    };

    const createdOrganization = await useCase.execute(createEntityInputDto);
    expect(createdOrganization).toEqual(expectedCreatedEntity);
  });

  it('should not allow creating two entities with the same nickname', async () => {
    const validName = 'valid-taxonomic-unit-name';
    const createOrganizationInputDto: ICreateFirstVersionOfTaxonomicUnitV1InputDto = {
      name: validName,
      schema: {
        properties: {
          parentId: {
            type: 'string',
          },
        },
        required: ['parentId'],
      },
    };

    const duplicatedNicknameOrganizationInputDto: ICreateFirstVersionOfTaxonomicUnitV1InputDto = {
      name: validName,
      schema: {
        properties: {
          parentId: {
            type: 'string',
          },
        },
        required: ['parentId'],
      },
    };

    await useCase.execute(createOrganizationInputDto);
    await expect(useCase.execute(duplicatedNicknameOrganizationInputDto)).rejects.toThrow(
      `Taxonomic Unit with name '${validName}' already exists`,
    );
  });
});
