import { faker } from '@faker-js/faker';
import { ValidationExceptionV2Error } from '@peerlab/kernel/shared-ts-utils/errors/validation-exception-v1';
import { TaxonomicUnitV1Entity } from './entity';
import { ITaxonomicUnitV1 } from './entity.schema.types';

describe('TaxonomicUnitV1Entity', () => {
  const validId = faker.database.mongodbObjectId().toString();
  it('should create a valid taxonomic unit v1 entity', async () => {
    const taxonomicUnitV1InputDto: ITaxonomicUnitV1 = {
      id: validId,
      version: 1,
      name: 'valid-taxonomic-unit-name',
      lineageIdPath: `/${validId}`,
      schema: {
        properties: {
          parentId: {
            type: 'string',
          },
        },
        required: ['name'],
      },
    };

    expect(new TaxonomicUnitV1Entity(taxonomicUnitV1InputDto).getDto()).toEqual({
      id: validId,
      version: 1,
      name: 'valid-taxonomic-unit-name',
      lineageIdPath: `/${validId}`,
      schema: {
        properties: {
          parentId: {
            type: 'string',
          },
        },
        required: ['name'],
      },
    });
  });

  it.each([-1])('should not create organization entity with invalid version', (invalidVersion) => {
    expect(
      () =>
        new TaxonomicUnitV1Entity({
          id: validId,
          version: invalidVersion,
          name: 'valid-taxonomic-unit-name',
          lineageIdPath: `/${validId}`,
          schema: {
            properties: {
              parentId: {
                type: 'string',
              },
            },
            required: ['name'],
          },
        }),
    ).toThrow(ValidationExceptionV2Error);
  });

  it.each(['/invalid-name'])('should not create organization entity with invalid id', (invalidName) => {
    expect(
      () =>
        new TaxonomicUnitV1Entity({
          id: validId,
          lineageIdPath: `/${validId}`,
          version: 1,
          name: invalidName,
          schema: {
            properties: {
              parentId: {
                type: 'string',
              },
            },
            required: ['name'],
          },
        }),
    ).toThrow(ValidationExceptionV2Error);
  });

  it.each([
    1,
    ['incorrect'],
    'wrong',
    undefined,
    NaN,
    { properties: 1 },
    { properties: [{ name: 1 }] },
    { properties: { name: { type: 1 } } },
    { properties: { name: { type: 'string', format: 1 } } },
    { id: 1, properties: { name: { type: 'string', format: 'uuid' } } },
    null,
    [],
  ])('should not create taxonomic unit v1 if schema does not conform with json schema', (invalidSchema) => {
    const taxonomicUnitV1InputDto: ITaxonomicUnitV1 = {
      id: validId,
      version: 1,
      name: 'valid-taxonomic-unit-name',
      // @ts-ignore - Explicitly test invalid schema without breaking the test due to typescript error
      schema: invalidSchema,
    };

    expect(() => new TaxonomicUnitV1Entity(taxonomicUnitV1InputDto)).toThrow(ValidationExceptionV2Error);
  });
});
