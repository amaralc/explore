import { IMultiUnitV1Dto } from '../../../../multi-unit-v1/core/entity.schema.types';
import { IMultiCentralV1Dto } from '../../entity.schema.types';
import { multiCentralsV1Fixtures } from '../../fixtures';
import { ExtractMultiUnitsV1FromMultiCentralsV1Service } from './index';

describe('ExtractMultiUnitsV1FromMultiCentralsV1Service', () => {
  it('should extract multi-units-v1 from multi-centrals-v1 with valid attributes', () => {
    // Given
    const multiCentralsV1DtoList: Array<IMultiCentralV1Dto> = [
      multiCentralsV1Fixtures[0],
      {
        ...multiCentralsV1Fixtures[0],
        unidade: {
          ...multiCentralsV1Fixtures[0].unidade,
          id: 2,
        },
      },
    ];

    // When
    const multiUnitsV1 = ExtractMultiUnitsV1FromMultiCentralsV1Service.execute(multiCentralsV1DtoList);

    // Then
    const expectedMultiUnitsV1: Array<IMultiUnitV1Dto> = [
      multiCentralsV1Fixtures[0].unidade,
      {
        ...multiCentralsV1Fixtures[0].unidade,
        id: 2,
      },
    ];

    expect(multiUnitsV1).toEqual(expectedMultiUnitsV1);
  });

  it('should only extract unique units', () => {
    // Given
    const multiCentralsV1DtoList: Array<IMultiCentralV1Dto> = [
      ...multiCentralsV1Fixtures,
      {
        ...multiCentralsV1Fixtures[0],
        id: 2,
        unidade: multiCentralsV1Fixtures[0].unidade,
      },
    ];

    // When
    const multiUnitsV1 = ExtractMultiUnitsV1FromMultiCentralsV1Service.execute(multiCentralsV1DtoList);

    // Then
    const expectedMultiUnitsV1: Array<IMultiUnitV1Dto> = [
      { id: 64, instituicao_id: 1, nome: 'Fake Center', sigla: 'FC' },
    ];

    expect(multiUnitsV1).toEqual(expectedMultiUnitsV1);
  });
});
