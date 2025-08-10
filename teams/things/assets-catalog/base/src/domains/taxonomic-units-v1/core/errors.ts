export class TaxonomicUnitV1NotFoundError extends Error {
  constructor() {
    super('Taxonomic unit not found');
  }
}
