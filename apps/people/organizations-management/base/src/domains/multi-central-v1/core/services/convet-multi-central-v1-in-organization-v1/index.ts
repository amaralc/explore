import { stringToSlug } from '@peerlab/kernel/shared-ts-utils/string-to-slug';
import { randomBytes } from 'crypto';
import { IOrganizationV1Dto } from '../../../../organizations-v1/core/entity';
import { IConvertMultiCentralV1InOrganizationV1InputDto } from './dtos';

export class ConvertMultiCentralV1InOrganizationV1Service {
  static execute(inputDto: IConvertMultiCentralV1InOrganizationV1InputDto): IOrganizationV1Dto {
    const { agentId, id, multiCentralV1, ownerAgentId } = inputDto;

    const slugId = randomBytes(12).toString('hex');

    const convertedOrganizationV1Dto: IOrganizationV1Dto = {
      id,
      ownerAgentId: ownerAgentId,
      agentId: agentId,
      createdAt: new Date().toISOString(),
      email: multiCentralV1.email,
      nickname: stringToSlug(multiCentralV1.sigla + '-' + slugId),
      planSubscriptionName: 'FREE',
      updatedAt: new Date().toISOString(),
    };

    return convertedOrganizationV1Dto;
  }
}
