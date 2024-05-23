import { hashIntegerAndEntityNameIntoValidFirebaseUID } from '@peerlab/kernel/shared-ts-utils/crypto/hash-integer-and-entity-name-into-valid-firebase-id';
import { hashIntegerAndEntityNameIntoValidObjectId } from '@peerlab/kernel/shared-ts-utils/crypto/hash-integer-and-entity-name-into-valid-object-id';
import { stringToSlug } from '@peerlab/kernel/shared-ts-utils/string-to-slug';
import { IOrganizationV1Dto } from '../../../../organizations-v1/core/entity';
import { IConvertMultiCentralV1InOrganizationV1InputDto } from './dto';

export class ConvertMultiCentralV1InOrganizationV1Service {
  static execute(inputDto: IConvertMultiCentralV1InOrganizationV1InputDto): IOrganizationV1Dto {
    const { multiCentralV1Dto, agentV1Dto } = inputDto;

    const id = hashIntegerAndEntityNameIntoValidObjectId(multiCentralV1Dto.id, 'MultiCentralV1');
    const unitId = multiCentralV1Dto.unidade_id;
    const ownerAgentId = hashIntegerAndEntityNameIntoValidFirebaseUID(unitId, 'MultiUnitV1');

    const convertedOrganizationV1Dto: IOrganizationV1Dto = {
      id,
      ownerAgentId: ownerAgentId,
      agentId: agentV1Dto.id,
      email: multiCentralV1Dto.email,
      nickname: stringToSlug(multiCentralV1Dto.sigla + '-' + id),
      planSubscriptionName: 'FREE',
      createdAt: new Date(multiCentralV1Dto.created).toISOString(),
      updatedAt: new Date(multiCentralV1Dto.updated).toISOString(),
    };

    return convertedOrganizationV1Dto;
  }
}
