import { hashIntegerIntoValidObjectId } from '@peerlab/kernel/shared-ts-utils/crypto/hash-integer-into-valid-object-id';
import { stringToSlug } from '@peerlab/kernel/shared-ts-utils/string-to-slug';
import { IOrganizationV1Dto } from '../../../../organizations-v1/core/entity';
import { IMultiInstitutionV1Dto } from '../../types';
import { ConvertMultiInstitutionV1InAgentV1Service } from '../convert-multi-institution-v1-in-agent-v1';

export class ConvertMultiInstitutionV1InOrganizationV1Service {
  static execute(inputDto: IMultiInstitutionV1Dto): IOrganizationV1Dto {
    const agentV1Dto = ConvertMultiInstitutionV1InAgentV1Service.execute(inputDto);

    const id = hashIntegerIntoValidObjectId(inputDto.id);

    const convertedOrganizationV1Dto: IOrganizationV1Dto = {
      id,
      ownerAgentId: agentV1Dto.id,
      agentId: agentV1Dto.id,
      email: agentV1Dto.email,
      nickname: stringToSlug(inputDto.sigla + '-' + id),
      planSubscriptionName: 'FREE',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    return convertedOrganizationV1Dto;
  }
}
