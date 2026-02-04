import { ITaxonomicUnitV1 } from '../../taxonomic-unit-v1/core/entity.schema.types';
import { TaxonomicUnitInstanceV1Entity } from './entity';
import { InstanceDataDoesNotConformWithInstanceSchemaError } from './errors';
describe('TaxonomicUnitInstanceV1Entity', () => {
  it('should initialize entity without throwing errors', () => {
    const taxonomicUnitV1InputDto: ITaxonomicUnitV1 = {
      id: 'valid-id',
      version: 1,
      name: 'valid-taxonomic-unit-name',
      lineageIdPath: `/${'valid-id'}`,
      metadata: {},
      metadataSchema: {
        type: 'object',
      },
      instanceSchema: {
        type: 'object',
        properties: {
          parentId: {
            type: 'string',
          },
        },
        required: ['name'],
      },
    };
    expect(
      () => new TaxonomicUnitInstanceV1Entity({ taxonomicUnitV1Dto: taxonomicUnitV1InputDto, instanceData: {} }),
    ).not.toThrow();
  });
  it('should throw error when data does not conform with instance schema', () => {
    const taxonomicUnitV1InputDto: ITaxonomicUnitV1 = {
      id: 'valid-id',
      version: 1,
      name: 'valid-taxonomic-unit-name',
      lineageIdPath: `/${'valid-id'}`,
      metadata: {},
      metadataSchema: {
        type: 'object',
      },
      instanceSchema: {
        type: 'object',
        properties: {
          parentId: {
            type: 'string',
          },
        },
        required: ['parentId'],
      },
    };
    expect(() =>
      new TaxonomicUnitInstanceV1Entity({
        taxonomicUnitV1Dto: taxonomicUnitV1InputDto,
        instanceData: { parentId: 1 },
      }).validate(),
    ).toThrow(InstanceDataDoesNotConformWithInstanceSchemaError);
  });
});
