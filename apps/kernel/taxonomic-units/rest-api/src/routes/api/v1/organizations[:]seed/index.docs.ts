import { PathItemObject } from 'openapi3-ts/oas30';
import { seedOrganizationV1Schema } from './post.docs';

export const organizationsV1SeedControllerSchema: PathItemObject = {
  description: 'Seed organizations',
  post: seedOrganizationV1Schema,
};
