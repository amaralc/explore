import { ValidationExceptionV2Error } from '@peerlab/kernel/shared-ts-utils/errors/validation-exception-v1';
import { TaxonomicUnitV1Entity } from './entity';
import { ITaxonomicUnitV1 } from './entity.schema.types';

describe('TaxonomicUnitV1Entity', () => {
  it('should create a valid taxonomic unit v1 entity', async () => {
    const taxonomicUnitV1InputDto: ITaxonomicUnitV1 = {
      version: 1,
      name: 'valid-taxonomic-unit-name',
      schema: {
        properties: {
          parentId: {
            type: 'string',
          },
        },
        required: ['name'],
      },
    };

    expect(new TaxonomicUnitV1Entity(taxonomicUnitV1InputDto)).toEqual({
      version: 1,
      name: 'valid-taxonomic-unit-name',
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
          version: invalidVersion,
          name: 'valid-taxonomic-unit-name',
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

  it.each([1, ['incorrect'], 'wrong', undefined, NaN])(
    'should not create taxonomic unit v1 if schema does not conform with json schema',
    (invalidSchema) => {
      expect(
        () =>
          new TaxonomicUnitV1Entity({
            version: 1,
            name: 'valid-taxonomic-unit-name',
            // @ts-ignore
            schema: invalidSchema,
          }),
      ).toThrow(ValidationExceptionV2Error);
    },
  );
});
