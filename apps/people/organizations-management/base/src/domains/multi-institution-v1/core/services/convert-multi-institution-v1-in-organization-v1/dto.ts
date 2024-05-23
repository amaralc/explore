import { IAgentV1Dto } from '../../../../agents-v1/core/entity';
import { IMultiInstitutionV1Dto } from '../../entity';

export type IConvertMultiInstitutionV1InOrganizationV1InputDto = {
  ownerAgentId: string;
  agentV1Dto: IAgentV1Dto;
  multiInstitutionV1Dto: IMultiInstitutionV1Dto;
};
