import { CustomEnum } from '@peerlab/kernel/shared-ts-utils/types/custom-enum';
import { agentV1JsonSchema } from '@peerlab/people/organizations-management/base/domains/agents-v1/core/entity';
import { Static, Type } from '@sinclair/typebox';

export const seedOrganizationsFromExternalSourceInputDtoSchema = Type.Object({
  sourceName: CustomEnum(['USP_MULTI'], {
    description: 'A string that identifies the source where organizations should be extracted from',
  }),
  agentAccountHolderId: agentV1JsonSchema.properties.id,
});

export type ISeedOrganizationsFromExternalSourceInputDto = Static<
  typeof seedOrganizationsFromExternalSourceInputDtoSchema
>;
