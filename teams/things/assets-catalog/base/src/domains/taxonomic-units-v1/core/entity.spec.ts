import { faker } from '@faker-js/faker';
import { iso8601DateFormat, mongoDbIdFormat } from '@peerlab/kernel/shared-ts-utils/date-formats';
import { ValidationExceptionV2Error } from '@peerlab/kernel/shared-ts-utils/errors/validation-exception-v1';
import { TaxonomicUnitV1Entity } from './entity';
describe('TaxonomicUnitV1Entity', () => {
  it('should create a valid taxonomic unit entity', async () => {
    expect(
      new TaxonomicUnitV1Entity({
        id: faker.database.mongodbObjectId().toString(),
        slug: 'valid-taxonomic-unit-slug',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }),
    ).toEqual({
      id: expect.stringMatching(mongoDbIdFormat),
      slug: 'valid-taxonomic-unit-slug',
      createdAt: expect.stringMatching(iso8601DateFormat),
      updatedAt: expect.stringMatching(iso8601DateFormat),
    });
  });
  it('should not create taxonomic unit entity with invalid id', () => {
    expect(
      () =>
        new TaxonomicUnitV1Entity({
          id: 'invalid-id',
          slug: 'valid-taxonomic-unit-slug',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }),
    ).toThrow(ValidationExceptionV2Error);
  });
  it.each(['x', 'invalid.slug', 'invalid/slug', '-invalid-', '--/inv'])(
    'should not create taxonomic unit entity with invalid slugs',
    (invalidSlug) => {
      expect(
        () =>
          new TaxonomicUnitV1Entity({
            id: faker.database.mongodbObjectId().toString(),
            slug: invalidSlug, // should have at least 3 characters
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          }),
      ).toThrow(ValidationExceptionV2Error);
    },
  );
});
