import { faker } from "@faker-js/faker";
import { TaxonomicUnitV1Entity } from "./entity";
import { ITaxonomicUnitV1 } from "./entity.schema.types";

interface IOverrides {
  inputDto?: Partial<ITaxonomicUnitV1>;
  parentDto?: ITaxonomicUnitV1;
}

class TaxonomicUnitV1Factory {
  create(overrides: IOverrides = {}): TaxonomicUnitV1Entity {
    const { inputDto, parentDto } = overrides;

    const defaultId = faker.database.mongodbObjectId().toString();
    const inputDtoWithDefaults: ITaxonomicUnitV1 = {
      id: defaultId,
      version: 1,
      name: 'valid-taxonomic-unit-name',
      lineageIdPath: parentDto ? `/${parentDto.id}/${defaultId}` : `/${defaultId}`,
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
      ...inputDto
    };

    return new TaxonomicUnitV1Entity(inputDtoWithDefaults, parentDto);
  }
}

export const taxonomicUnitV1Factory = new TaxonomicUnitV1Factory();