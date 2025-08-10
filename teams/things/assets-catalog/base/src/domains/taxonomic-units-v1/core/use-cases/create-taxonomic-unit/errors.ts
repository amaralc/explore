export class TaxonomicUnitAlreadyExistsError extends Error {
  constructor() {
    super('Taxonomic unit with same slug already exists');
  }
}
