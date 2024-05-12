import { IAgentV1Dto } from '../../../../agents-v1/core/entity';
import { IMultiCentralV1Dto } from '../../entity';

export type IConvertMultiCentralV1InOrganizationV1InputDto = {
  ownerAgentId: string;
  agentV1: IAgentV1Dto;
  multiCentralV1: IMultiCentralV1Dto;
};
