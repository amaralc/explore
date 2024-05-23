import { hashIntegerAndEntityNameIntoValidFirebaseUID } from '@peerlab/kernel/shared-ts-utils/crypto/hash-integer-and-entity-name-into-valid-firebase-id';
import { hashIntegerAndEntityNameIntoValidObjectId } from '@peerlab/kernel/shared-ts-utils/crypto/hash-integer-and-entity-name-into-valid-object-id';
import { stringToSlug } from '@peerlab/kernel/shared-ts-utils/string-to-slug';
import { IOrganizationV1Dto } from '../../../../organizations-v1/core/entity';
import { MultiUnitV1Entity } from '../../entity';
import { ConvertMultiUnitV1InAgentV1Service } from '../convert-multi-unit-v1-in-agent-v1';
import { IConvertMultiUnitV1InOrganizationV1InputDto } from './dto';

export class ConvertMultiUnitV1InOrganizationV1Service {
  static execute(inputDto: IConvertMultiUnitV1InOrganizationV1InputDto): IOrganizationV1Dto {
    const { multiUnitV1Dto, ownerAgentId } = inputDto;

    MultiUnitV1Entity.validate(multiUnitV1Dto);

    const agentV1Dto = ConvertMultiUnitV1InAgentV1Service.execute(multiUnitV1Dto);
    const id = hashIntegerAndEntityNameIntoValidObjectId(multiUnitV1Dto.id, 'MultiUnitV1');
    const agentId = hashIntegerAndEntityNameIntoValidFirebaseUID(multiUnitV1Dto.id, 'MultiUnitV1');

    const convertedOrganizationV1Dto: IOrganizationV1Dto = {
      id,
      ownerAgentId: ownerAgentId,
      agentId: agentId,
      email: agentV1Dto.email,
      nickname: stringToSlug(multiUnitV1Dto.sigla + '-' + id),
      planSubscriptionName: 'FREE',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    return convertedOrganizationV1Dto;
  }
}
