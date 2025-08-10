import { IPaginatedEntitiesV2 } from '@peerlab/kernel/shared-ts-utils/paginated-entities';
import { TaxonomicUnitsV1DatabaseRepository } from '../../database-repository';
import { IFilterTaxonomicUnitsV1InputDto } from '../../database-repository.types';
import { ITaxonomicUnitV1 } from '../../entity.schema.types';

export class FilterTaxonomicUnitsV1UseCase {
  constructor(private readonly taxonomicUnitsV1DatabaseRepository: TaxonomicUnitsV1DatabaseRepository) {}

  public async execute(inputDto: IFilterTaxonomicUnitsV1InputDto): Promise<IPaginatedEntitiesV2<ITaxonomicUnitV1>> {
    const paginatedResult = await this.taxonomicUnitsV1DatabaseRepository.filterPaginated(inputDto);
    return paginatedResult;
  }
}
