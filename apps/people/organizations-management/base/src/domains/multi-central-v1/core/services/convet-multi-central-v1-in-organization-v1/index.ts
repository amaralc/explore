import { hashIntegerIntoValidObjectId } from '@peerlab/kernel/shared-ts-utils/crypto/hash-integer-into-valid-object-id';
import { stringToSlug } from '@peerlab/kernel/shared-ts-utils/string-to-slug';
import { IOrganizationV1Dto } from '../../../../organizations-v1/core/entity';
import { IConvertMultiCentralV1InOrganizationV1InputDto } from './dto';

export class ConvertMultiCentralV1InOrganizationV1Service {
  static execute(inputDto: IConvertMultiCentralV1InOrganizationV1InputDto): IOrganizationV1Dto {
    const { multiCentralV1, agentV1, ownerAgentId } = inputDto;

    const id = hashIntegerIntoValidObjectId(multiCentralV1.id);

    const convertedOrganizationV1Dto: IOrganizationV1Dto = {
      id,
      ownerAgentId: ownerAgentId,
      agentId: agentV1.id,
      email: multiCentralV1.email,
      nickname: stringToSlug(multiCentralV1.sigla + '-' + id),
      planSubscriptionName: 'FREE',
      createdAt: new Date(multiCentralV1.created).toISOString(),
      updatedAt: new Date(multiCentralV1.updated).toISOString(),
    };

    return convertedOrganizationV1Dto;
  }
}
