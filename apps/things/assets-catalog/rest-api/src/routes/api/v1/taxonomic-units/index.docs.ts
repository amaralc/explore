import { PathItemObject } from 'openapi3-ts/oas30';
import { postTaxonomicUnitV1Schema } from './post.docs';

export const taxonomicUnitV1ControllerSchema: PathItemObject = {
  description: 'Manage taxonomic unit v1 resources',
  post: postTaxonomicUnitV1Schema,
};
