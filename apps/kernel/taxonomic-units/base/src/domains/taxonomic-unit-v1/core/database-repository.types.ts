import { IPaginationV1Dto } from '@peerlab/kernel/shared-ts-utils/pagination-dto';

interface IFilterTaxonomicUnitsV1Query {
  ownerAgentId?: string;
}

export interface IFilterTaxonomicUnitsV1InputDto {
  query: IFilterTaxonomicUnitsV1Query;
  pagination: IPaginationV1Dto;
}
