import { faker } from '@faker-js/faker';

import { TaxonomicUnitV1Entity } from './entity';
import { ITaxonomicUnitV1 } from './entity.schema.types';
import { ChildMetadataSchemaIsNotBackwardsCompatibleWithParentMetadataSchemaError, InvalidTaxonomicUnitV1InputDtoError, MetadataDoesNotMatchMetadataSchemaError } from './errors';
import { taxonomicUnitV1Factory } from './factory';

describe('TaxonomicUnitV1Entity', () => {
  const validId = faker.database.mongodbObjectId().toString();

  describe('Validation', () => {
    it('should instantiate class without throwing errors even with invalid data', () => {
      const invalidInputDto = {};

      expect(
        // @ts-expect-error - Explicitly test invalid input without breaking the test due to typescript error
        () => new TaxonomicUnitV1Entity(invalidInputDto, null),
      ).not.toThrow();
    })

    it('should create a valid taxonomic unit v1 entity', async () => {
      const taxonomicUnitV1InputDto: ITaxonomicUnitV1 = {
        id: validId,
        version: 1,
        name: 'valid-taxonomic-unit-name',
        lineageIdPath: `/${validId}`,
        metadata: {},
        metadataSchema: {
          type: 'object'
        },
        instanceSchema: {
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
        metadata: {},
        metadataSchema: {
          type: 'object'
        },
        instanceSchema: {
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
            metadata: {},
            metadataSchema: {
              type: 'object'
            },
            instanceSchema: {
              properties: {
                parentId: {
                  type: 'string',
                },
              },
              required: ['name'],
            },
          }).validate(),
      ).toThrow(InvalidTaxonomicUnitV1InputDtoError);
    });

    it.each(['/invalid-name'])('should not create organization entity with invalid id', (invalidName) => {
      expect(
        () =>
          new TaxonomicUnitV1Entity({
            id: validId,
            lineageIdPath: `/${validId}`,
            version: 1,
            name: invalidName,
            metadataSchema: {
              type: 'object',
            },
            metadata: {},
            instanceSchema: {
              properties: {
                parentId: {
                  type: 'string',
                },
              },
              required: ['name'],
            },
          }).validate(),
      ).toThrow(InvalidTaxonomicUnitV1InputDtoError);
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
      { $id: 1, properties: { name: { type: 'string', format: 'uuid' } } },
      null,
      [],
    ] as Array<unknown>)('should not create taxonomic unit v1 if instanceSchema does not conform with json schema', (invalidSchema) => {
      const taxonomicUnitV1InputDto: ITaxonomicUnitV1 = {
        id: validId,
        version: 1,
        name: 'valid-taxonomic-unit-name',
        instanceSchema: invalidSchema,
        lineageIdPath: `/${validId}`,
        metadataSchema: {
          type: 'object',
        },
        metadata: {},
      };

      expect(() => new TaxonomicUnitV1Entity(taxonomicUnitV1InputDto).validate()).toThrow(InvalidTaxonomicUnitV1InputDtoError);
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
      { $id: 1, properties: { name: { type: 'string', format: 'uuid' } } },
      null,
      [],
    ])('should not create taxonomic unit v1 if metadataSchema does not conform with json schema', (invalidSchema) => {
      const taxonomicUnitV1InputDto: ITaxonomicUnitV1 = {
        id: validId,
        version: 1,
        name: 'valid-taxonomic-unit-name',
        instanceSchema: {
          type: 'object',
          properties: {
            parentId: {
              type: 'string',
            },
          },
          required: ['parentId'],
        },
        lineageIdPath: `/${validId}`,
        // @ts-expect-error - Explicitly test invalid schema without breaking the test due to typescript error
        metadataSchema: invalidSchema,
        metadata: {},
      };

      expect(() => new TaxonomicUnitV1Entity(taxonomicUnitV1InputDto).validate()).toThrow(InvalidTaxonomicUnitV1InputDtoError);
    });

    it('should not create taxonomic unit v1 if metadata does not conform with metadataSchema', () => {
      const parentTaxonomicUnitDto = taxonomicUnitV1Factory.create().getDto();
      const childTaxonomicUnitEntity = taxonomicUnitV1Factory.create({
        parentDto: parentTaxonomicUnitDto,
        inputDto: {
          metadataSchema: {
            type: 'object',
            additionalProperties: parentTaxonomicUnitDto.metadataSchema.additionalProperties,
            properties: {
              name: {
                type: 'string',
              },
            },
            required: ['name'],
          },
          metadata: {
            parentId: 'fake-id',
          }
        }
      })

      expect(() => childTaxonomicUnitEntity.validate()).toThrow(MetadataDoesNotMatchMetadataSchemaError);
    });
  })

  describe('Backwards Compatible Inheritance of Parent Metadata Schema', () => {
    it('should not create child that do not have all required properties from parent', () => {
      const parentTaxonomicUnit = taxonomicUnitV1Factory.create();
      const childId = faker.database.mongodbObjectId().toString();

      const parentId = parentTaxonomicUnit.getDto().id;
      const parentTaxonomicUnitDto: ITaxonomicUnitV1 = {
        id: parentId,
        version: 1,
        name: 'valid-taxonomic-unit-name',
        lineageIdPath: `/${parentId}`,
        metadataSchema: {
          type: 'object',
          additionalProperties: false,
          properties: {
            name: {
              type: 'string',
            },
            color: {
              type: 'string',
              enum: ['blue'],
            },
            ownerId: {
              anyOf: [
                { type: 'string', pattern: '^[0-9a-fA-F]{24}$' },
                { type: 'null' }
              ]
            }
          },
          required: ['name'],
        },
        metadata: {
          name: 'valid-metadata-name',
          color: 'blue',
          ownerId: null
        },
        instanceSchema: {
          properties: {
            parentId: {
              type: 'string',
            },
          },
          required: ['name'],
        },
      };

      const childTaxonomicUnitDto: ITaxonomicUnitV1 = {
        id: childId,
        version: 1,
        name: 'valid-taxonomic-unit-name',
        lineageIdPath: `/${parentId}/${childId}`,
        metadataSchema: {
          type: 'object',
          properties: {
            age: {
              type: 'integer',
            },
          },
          required: ['age'],
        },
        metadata: {
          age: 10,
        },
        instanceSchema: {
          properties: {
            parentId: {
              type: 'string',
            },
          },
          required: ['name'],
        },
      }

      expect(() => new TaxonomicUnitV1Entity(childTaxonomicUnitDto, parentTaxonomicUnitDto)).toThrow(ChildMetadataSchemaIsNotBackwardsCompatibleWithParentMetadataSchemaError);
    });

    /**
     * We wont stres too much this test case because that is being already ensured in apps/kernel/shared-ts-utils/src/validators/json-schema/index.spec.ts
     */
    it.each([
      {
        parentMetadataSchema: {
          type: 'object',
          additionalProperties: false,
          properties: {
            name: {
              type: 'string',
            },
          },
          required: ['name'],
        },
        childMetadataSchema: {
          type: 'object',
          additionalProperties: false,
          properties: {
            name: {
              type: 'number',
            },
          },
          required: ['name'],
        },
      },
      {
        parentMetadataSchema: {
          type: 'object',
          additionalProperties: false,
          properties: {
            name: {
              type: 'string',
            },
            friends: {
              type: 'array',
              items: {
                type: 'string',
              }
            },
          },
          required: ['name'],
        },
        childMetadataSchema: {
          type: 'object',
          additionalProperties: false,
          properties: {
            name: {
              type: 'string',
            },
            friends: {
              type: 'object',
              properties: {
                name: {
                  type: 'string',
                }
              }
            },
          },
          required: ['name'],
        },
      },
      {
        parentMetadataSchema: {
          type: 'object',
          additionalProperties: false,
          properties: {
            name: {
              type: 'string',
            },
            friends: {
              type: 'array',
              items: {
                type: 'string',
              }
            },
          },
          required: ['name'],
        },
        childMetadataSchema: {
          type: 'object',
          additionalProperties: false,
          properties: {
            name: {
              type: 'string',
            },
            friends: {
              type: 'array',
              items: {
                type: 'number',
              }
            },
          },
          required: ['name'],
        },
      },
      {
        parentMetadataSchema: {
          type: 'object',
          additionalProperties: false,
          properties: {
            name: {
              type: 'string',
            },
            friends: {
              type: 'array',
              items: {
                type: 'string',
              }
            },
          },
          required: ['name'],
        },
        childMetadataSchema: {
          type: 'object',
          additionalProperties: false,
          properties: {
            name: {
              type: 'string',
            },
            friends: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  name: {
                    type: 'string',
                  }
                }
              }
            },
          },
          required: ['name'],
        },
      },
      {
        parentMetadataSchema: {
          type: 'array',
        },
        childMetadataSchema: {
          type: 'object',
        },

      }
    ] as Array<{ parentMetadataSchema: ITaxonomicUnitV1['metadataSchema']; childMetadataSchema: ITaxonomicUnitV1['metadataSchema'] }>)('should not allow child to have properties with incompatible types', ({ parentMetadataSchema, childMetadataSchema }) => {

      const parentId = faker.database.mongodbObjectId().toString();
      const parentTaxonomicUnitDto: ITaxonomicUnitV1 = {
        id: parentId,
        version: 1,
        name: 'valid-taxonomic-unit-name',
        lineageIdPath: `/${parentId}`,
        metadataSchema: parentMetadataSchema,
        metadata: {
          name: 'valid-metadata-name',
        },
        instanceSchema: {
          properties: {
            parentId: {
              type: 'string',
            },
          },
          required: ['name'],
        },
      };

      const childId = faker.database.mongodbObjectId().toString();
      const childTaxonomicUnitDto: ITaxonomicUnitV1 = {
        id: childId,
        version: 1,
        name: 'valid-taxonomic-unit-name',
        lineageIdPath: `/${parentId}/${childId}`,
        metadataSchema: childMetadataSchema,
        metadata: {
          name: 'valid-metadata-name',
        },
        instanceSchema: parentTaxonomicUnitDto.instanceSchema,
      };

      expect(() => new TaxonomicUnitV1Entity(childTaxonomicUnitDto, parentTaxonomicUnitDto)).toThrow(ChildMetadataSchemaIsNotBackwardsCompatibleWithParentMetadataSchemaError);
    });

    it('should create child that have all required properties from parent', () => {
      const parentId = faker.database.mongodbObjectId().toString();
      const parentTaxonomicUnitDto = taxonomicUnitV1Factory.create().getDto();

      const childId = faker.database.mongodbObjectId().toString();
      const childTaxonomicUnitDto: ITaxonomicUnitV1 = {
        id: childId,
        version: 1,
        name: 'valid-taxonomic-unit-name',
        lineageIdPath: `/${parentId}/${childId}`,
        metadataSchema: {
          type: 'object',
          required: ['name'],
          additionalProperties: false,
          properties: {
            name: {
              type: 'string',
            },
          }
        },
        metadata: {
          name: 'valid-metadata-name',
        },
        instanceSchema: parentTaxonomicUnitDto.instanceSchema,
      }

      expect(() => new TaxonomicUnitV1Entity(childTaxonomicUnitDto, parentTaxonomicUnitDto)).not.toThrow();
    });

  });
})
