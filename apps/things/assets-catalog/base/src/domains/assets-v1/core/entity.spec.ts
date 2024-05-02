import { faker } from '@faker-js/faker';
import { mongoDbIdFormat } from '@peerlab/kernel/shared-ts-utils/date-formats';
import { ValidationExceptionV2Error } from '@peerlab/kernel/shared-ts-utils/errors/validation-exception-v1';
import { AssetV1Entity } from './entity';

describe('AssetV1Entity', () => {
  it('should create a valid taxonomic unit entity', async () => {
    const createdAt = new Date().toISOString();
    const updatedAt = new Date().toISOString();

    expect(
      new AssetV1Entity({
        id: faker.database.mongodbObjectId().toString(),
        name: 'Asset name',
        taxonomicUnitSlug: 'valid-taxonomic-unit-slug',
        tags: ['tag1', 'tag2', 'tag3'],
        createdAt,
        updatedAt,
      }),
    ).toEqual({
      id: expect.stringMatching(mongoDbIdFormat),
      name: 'Asset name',
      taxonomicUnitSlug: 'valid-taxonomic-unit-slug',
      tags: ['tag1', 'tag2', 'tag3'],
      createdAt,
      updatedAt,
    });
  });

  it.each(['id', 'invalid-id', 'a23f0a-x1af3a'])(
    'should not create taxonomic unit entity with invalid id',
    (invalidId) => {
      expect(
        () =>
          new AssetV1Entity({
            id: invalidId,
            name: 'Asset name',
            taxonomicUnitSlug: 'valid-taxonomic-unit-slug',
            tags: ['tag1', 'tag2', 'tag3'],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          }),
      ).toThrow(ValidationExceptionV2Error);
    },
  );

  it.each(['x', 'invalid.slug', 'invalid/slug', '-invalid-', '--/inv'])(
    'should not create taxonomic unit entity with invalid taxonomic unit slug',
    (invalidTaxonomicUnitSlug) => {
      expect(
        () =>
          new AssetV1Entity({
            id: faker.database.mongodbObjectId().toString(),
            name: 'Asset name',
            taxonomicUnitSlug: invalidTaxonomicUnitSlug,
            tags: ['tag1', 'tag2', 'tag3'],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          }),
      ).toThrow(ValidationExceptionV2Error);
    },
  );

  it.each(['x', 'invalid.slug', 'invalid/slug', '-invalid-', '--/inv', ''])(
    'should not create taxonomic unit entity with invalid tags',
    (invalidTaxonomicUnitSlug) => {
      expect(
        () =>
          new AssetV1Entity({
            id: faker.database.mongodbObjectId().toString(),
            name: 'Asset name',
            taxonomicUnitSlug: 'valid-taxonomic-unit-slug',
            tags: ['tag1', invalidTaxonomicUnitSlug, 'tag3'],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          }),
      ).toThrow(ValidationExceptionV2Error);
    },
  );
});
