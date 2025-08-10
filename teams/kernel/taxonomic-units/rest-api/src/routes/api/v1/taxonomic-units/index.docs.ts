import { PathItemObject } from 'openapi3-ts/oas30';
import { getTaxonomicUnitsV1Schema } from './get.docs';
import { postTaxonomicUnitsV1Schema } from './post.docs';

export const taxonomicUnitsV1Schema: PathItemObject = {
  description: 'Manage organization resources',
  post: postTaxonomicUnitsV1Schema,
  get: getTaxonomicUnitsV1Schema,
};
