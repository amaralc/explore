import { IMultiInstitutionV1Dto } from './entity';

export abstract class MultiInstitutionsV1DatabaseRepository {
  abstract listAll(): Promise<Array<IMultiInstitutionV1Dto>>;
}
