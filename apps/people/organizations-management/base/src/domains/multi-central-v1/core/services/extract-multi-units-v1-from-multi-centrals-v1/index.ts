import { IMultiUnitV1Dto } from '../../../../multi-unit-v1/core/entity.schema.types';
import { IMultiCentralV1Dto } from '../../entity.schema.types';

export class ExtractMultiUnitsV1FromMultiCentralsV1Service {
  static execute(multiCentralsV1DtoList: Array<IMultiCentralV1Dto>): Array<IMultiUnitV1Dto> {
    const allMultiUnitsV1 = multiCentralsV1DtoList.map((item) => item.unidade);
    const nonNullMultiUnitsV1 = allMultiUnitsV1.filter(Boolean);
    const stringifiedUnitsV1 = nonNullMultiUnitsV1.map((item) => JSON.stringify(item));
    const uniqueMultiUnitsV1 = [...new Set(stringifiedUnitsV1).values()].map((item) => JSON.parse(item));
    return uniqueMultiUnitsV1;
  }
}
