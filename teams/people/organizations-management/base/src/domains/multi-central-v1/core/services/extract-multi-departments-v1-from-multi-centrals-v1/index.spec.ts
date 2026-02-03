import { IMultiDepartmentV1Dto } from '../../../../multi-department-v1/core/entity.schema.types';
import { IMultiCentralV1Dto } from '../../entity.schema.types';
import { multiCentralsV1Fixtures } from '../../fixtures';
import { ExtractMultiDepartmentsV1FromMultiCentralsV1Service } from './index';
describe('ExtractMultiDepartmentsV1FromMultiCentralsV1ServiceService', () => {
  it('should extract multi-departments-v1 from multi-centrals-v1 with valid attributes', () => {
    // Given
    const multiCentralsV1DtoList: Array<IMultiCentralV1Dto> = [
      multiCentralsV1Fixtures[0],
      {
        ...multiCentralsV1Fixtures[0],
        id: 2,
        departamento: {
          ...multiCentralsV1Fixtures[0].departamento,
          id: 2,
        },
      },
    ];
    // When
    const multiDepartmentsV1 = ExtractMultiDepartmentsV1FromMultiCentralsV1Service.execute(multiCentralsV1DtoList);
    // Then
    const expectedMultiDepartmentsV1: Array<IMultiDepartmentV1Dto> = [
      multiCentralsV1Fixtures[0].departamento,
      {
        ...multiCentralsV1Fixtures[0].departamento,
        id: 2,
      },
    ];
    expect(multiDepartmentsV1).toEqual(expectedMultiDepartmentsV1);
  });
  it('should only extract unique departments', () => {
    // Given
    const multiCentralsV1DtoList: Array<IMultiCentralV1Dto> = [
      ...multiCentralsV1Fixtures,
      {
        ...multiCentralsV1Fixtures[0],
        id: 2,
        departamento: multiCentralsV1Fixtures[0].departamento,
      },
    ];
    // When
    const multiDepartmentsV1 = ExtractMultiDepartmentsV1FromMultiCentralsV1Service.execute(multiCentralsV1DtoList);
    // Then
    const expectedMultiDepartmentsV1: Array<IMultiDepartmentV1Dto> = [
      {
        id: 2510,
        instituicao_id: 1,
        unidade_id: 64,
        nome: 'Fake Department',
      },
    ];
    expect(multiDepartmentsV1).toEqual(expectedMultiDepartmentsV1);
  });
  it('should discard null departments', () => {
    // Given
    const multiCentralsV1DtoList: Array<IMultiCentralV1Dto> = [
      ...multiCentralsV1Fixtures,
      {
        ...multiCentralsV1Fixtures[0],
        id: 2,
        departamento: null,
      },
    ];
    // When
    const multiDepartmentsV1 = ExtractMultiDepartmentsV1FromMultiCentralsV1Service.execute(multiCentralsV1DtoList);
    // Then
    const expectedMultiDepartmentsV1: Array<IMultiDepartmentV1Dto> = [
      {
        id: 2510,
        instituicao_id: 1,
        unidade_id: 64,
        nome: 'Fake Department',
      },
    ];
    expect(multiDepartmentsV1).toEqual(expectedMultiDepartmentsV1);
  });
});
