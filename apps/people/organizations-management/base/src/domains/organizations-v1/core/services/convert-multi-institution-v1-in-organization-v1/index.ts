import { stringToSlug } from '@peerlab/kernel/shared-ts-utils/string-to-slug';
import { randomBytes } from 'crypto';
import { IOrganizationV1Dto } from '../../entity';
import { IConvertMultiInstitutionV1InOrganizationV1InputDto } from './input.dto';

export class ConvertMultiInstitutionV1InOrganizationV1Service {
  static execute(inputDto: IConvertMultiInstitutionV1InOrganizationV1InputDto): IOrganizationV1Dto {
    const { agentV1Dto, id, multiInstitutionV1Dto, ownerAgentId } = inputDto;

    const slugId = randomBytes(12).toString('hex');

    const convertedOrganizationV1Dto: IOrganizationV1Dto = {
      id,
      ownerAgentId: ownerAgentId,
      agentId: agentV1Dto.id,
      email: agentV1Dto.email,
      nickname: stringToSlug(multiInstitutionV1Dto.sigla + '-' + slugId),
      planSubscriptionName: 'FREE',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    return convertedOrganizationV1Dto;
  }
}
