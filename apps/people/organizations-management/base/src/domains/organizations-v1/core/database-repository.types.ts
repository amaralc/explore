import { IPaginationV1Dto } from '@peerlab/kernel/shared-ts-utils/pagination-dto';

interface IFilterOrganizationV1Query {
  ownerAgentId?: string;
}

export interface IFilterOrganizationV1InputDto {
  query: IFilterOrganizationV1Query;
  pagination: IPaginationV1Dto;
}
