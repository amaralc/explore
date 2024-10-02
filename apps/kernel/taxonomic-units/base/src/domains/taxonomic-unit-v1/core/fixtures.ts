import { faker } from '@faker-js/faker';
import { TaxonomicUnitV1Entity } from './entity';
import { ITaxonomicUnitV1 } from './entity.schema.types';

const id01 = faker.database.mongodbObjectId().toString();
const fakeTaxonomicUnit01 = new TaxonomicUnitV1Entity({
  id: id01,
  version: 1,
  name: 'fake-taxonomic-unit-01',
  lineageIdPath: '/' + id01,
  schema: {
    type: 'object',
    properties: {
      parentId: {
        type: 'string',
      },
    },
    additionalProperties: false,
    required: ['parentId'],
  },
});

const id02 = faker.database.mongodbObjectId().toString();
const fakeTaxonomicUnit02 = new TaxonomicUnitV1Entity({
  id: id02,
  version: 2,
  name: 'fake-taxonomic-unit-02',
  lineageIdPath: '/' + id01 + '/' + id02,
  schema: {
    type: 'object',
    properties: {
      parentId: {
        type: 'string',
      },
      name: {
        oneOf: [{ type: 'string' }, { type: 'null' }],
      },
    },
    required: ['parentId', 'name'],
  },
});

const id03 = faker.database.mongodbObjectId().toString();
const fakeTaxonomicUnit03 = new TaxonomicUnitV1Entity({
  id: id03,
  version: 1,
  name: 'fake-taxonomic-unit-03',
  lineageIdPath: '/' + id03,
  schema: {
    properties: {
      name: {
        type: 'string',
      },
    },
    required: ['name'],
  },
});

export const fakeTaxonomicUnitsV1 = [
  fakeTaxonomicUnit01.getDto(),
  fakeTaxonomicUnit02.getDto(),
  fakeTaxonomicUnit03.getDto(),
];

const taxonomicUnitsV1ByNameOrId: Map<string, ITaxonomicUnitV1> = new Map();
fakeTaxonomicUnitsV1.forEach((entityDto) => {
  if (taxonomicUnitsV1ByNameOrId.has(entityDto.id) || taxonomicUnitsV1ByNameOrId.has(entityDto.name)) {
    throw new Error(`Taxonomic Unit with id ${entityDto.id} or name ${entityDto.name} already exists`);
  }
  taxonomicUnitsV1ByNameOrId.set(entityDto.id, entityDto);
  taxonomicUnitsV1ByNameOrId.set(entityDto.name, entityDto);
});

export const fakeTaxonomicUnitsByNameOrId = taxonomicUnitsV1ByNameOrId;
