import { randomBytes } from 'crypto';
import { TaxonomicUnitV1Entity } from './entity';

export const fakeTaxonomicUnitsV1 = [
  new TaxonomicUnitV1Entity({
    slug: 'fake-slug',
    id: randomBytes(12).toString('hex'),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }),
];

const taxonByIdOrSlug: Map<string, TaxonomicUnitV1Entity> = new Map();
fakeTaxonomicUnitsV1.forEach((taxonomicUnit) => {
  if (taxonByIdOrSlug.has(taxonomicUnit.id) || taxonByIdOrSlug.has(taxonomicUnit.slug)) {
    throw new Error(`Agent with id ${taxonomicUnit.id} or slug ${taxonomicUnit.slug} already exists`);
  }
  taxonByIdOrSlug.set(taxonomicUnit.id, taxonomicUnit);
  taxonByIdOrSlug.set(taxonomicUnit.slug, taxonomicUnit);
});

export const fakeTaxonsByIdOrSlug = taxonByIdOrSlug;
