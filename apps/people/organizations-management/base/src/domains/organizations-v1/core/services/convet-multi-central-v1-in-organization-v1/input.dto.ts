import { IMultiCentralV1 } from '../../../../multi-central-v1/core/types';

export type IConvertMultiCentralV1InOrganizationV1InputDto = {
  id: string;
  agentId: string;
  ownerAgentId: string;
  multiCentralV1: IMultiCentralV1;
};
