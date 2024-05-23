import { IAgentV1Dto } from '../../../../agents-v1/core/entity';
import { IMultiCentralV1Dto } from '../../entity';

export type IConvertMultiCentralV1InOrganizationV1InputDto = {
  agentV1Dto: IAgentV1Dto;
  multiCentralV1Dto: IMultiCentralV1Dto;
};
