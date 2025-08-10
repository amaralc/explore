import { PathItemObject } from 'openapi3-ts/oas30';
import { postTaxonomicUnitsInstanceV1Schema } from './post.docs';

export const taxonomicUnitInstancesV1Schema: PathItemObject = {
  description: 'Create Instances of Taxonomic Units',
  post: postTaxonomicUnitsInstanceV1Schema,
};
