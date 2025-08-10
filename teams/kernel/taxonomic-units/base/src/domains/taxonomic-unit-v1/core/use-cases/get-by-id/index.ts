import { TaxonomicUnitsV1DatabaseRepository } from '../../database-repository';
import { ITaxonomicUnitV1 } from '../../entity.schema.types';
import { TaxonomicUnitV1NotFoundError } from '../../errors';

export class GetTaxonomicUnitV1ByIdUseCase {
  private taxonomicUnitsV1DatabaseRepository: TaxonomicUnitsV1DatabaseRepository;
  private entityTitle = 'Taxonomic Unit';

  constructor(taxonomicUnitsV1DatabaseRepository: TaxonomicUnitsV1DatabaseRepository) {
    this.taxonomicUnitsV1DatabaseRepository = taxonomicUnitsV1DatabaseRepository;
  }

  public async execute(id: string): Promise<ITaxonomicUnitV1> {
    const entityDto = await this.taxonomicUnitsV1DatabaseRepository.findById(id);
    if (!entityDto) {
      throw new TaxonomicUnitV1NotFoundError(`${this.entityTitle} with id '${id}' not found`);
    }
    return entityDto;
  }
}
