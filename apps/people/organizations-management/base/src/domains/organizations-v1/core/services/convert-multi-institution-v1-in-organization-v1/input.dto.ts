import { IAgentV1Dto } from '../../../../agents-v1/core/entity';
import { IMultiInstitutionV1Dto } from '../../../../multi-institution-v1/core/types';

export type IConvertMultiInstitutionV1InOrganizationV1InputDto = {
  id: string;
  ownerAgentId: string;
  agentV1Dto: IAgentV1Dto;
  multiInstitutionV1Dto: IMultiInstitutionV1Dto;
};
