import { IMultiCentralV1Dto } from './entity';

export abstract class MultiCentralsV1DatabaseRepository {
  abstract listAll(): Promise<Array<IMultiCentralV1Dto>>;
}
