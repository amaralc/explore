import postOrganizationsV1SeedSchema from './post.schema';
import { ISeedOrganizationsFromExternalSourceInputDto as IInputDto } from './post.schema.types';

export const seedOrganizationsFromExternalSourceInputDtoSchema = postOrganizationsV1SeedSchema;
export type ISeedOrganizationsFromExternalSourceInputDto = IInputDto;
