import { IMultiDepartmentV1Dto } from '../../../../multi-department-v1/core/entity.schema.types';
import { IMultiCentralV1Dto } from '../../entity.schema.types';

export class ExtractMultiDepartmentsV1FromMultiCentralsV1Service {
  static execute(multiCentralsV1DtoList: Array<IMultiCentralV1Dto>): Array<IMultiDepartmentV1Dto> {
    const allMultiDepartmentsV1 = multiCentralsV1DtoList.map((item) => item.departamento);
    const nonNullMultiDepartmentsV1 = allMultiDepartmentsV1.filter(Boolean);
    const stringifiedDepartmentsV1 = nonNullMultiDepartmentsV1.map((item) => JSON.stringify(item));
    const uniqueMultiDepartmentsV1 = [...new Set(stringifiedDepartmentsV1).values()].map((item) => JSON.parse(item));
    return uniqueMultiDepartmentsV1;
  }
}
