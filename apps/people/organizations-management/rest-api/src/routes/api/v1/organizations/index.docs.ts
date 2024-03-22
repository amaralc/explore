import { PathItemObject } from 'openapi3-ts/oas30';
import { postOrganizationV1Schema } from './post.docs';

export const organizationsV1ControllerSchema: PathItemObject = {
  description: 'Manage organization resources',
  post: postOrganizationV1Schema,
};
