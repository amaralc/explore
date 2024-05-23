import { hashIntegerAndEntityNameIntoValidFirebaseUID } from '@peerlab/kernel/shared-ts-utils/crypto/hash-integer-and-entity-name-into-valid-firebase-id';
import { hashIntegerAndEntityNameIntoValidObjectId } from '@peerlab/kernel/shared-ts-utils/crypto/hash-integer-and-entity-name-into-valid-object-id';
import { stringToSlug } from '@peerlab/kernel/shared-ts-utils/string-to-slug';
import { IOrganizationV1Dto } from '../../../../organizations-v1/core/entity';
import { MultiInstitutionV1Entity } from '../../entity';
import { ConvertMultiInstitutionV1InAgentV1Service } from '../convert-multi-institution-v1-in-agent-v1';
import { IConvertMultiInstitutionV1InOrganizationV1InputDto } from './dto';

export class ConvertMultiInstitutionV1InOrganizationV1Service {
  static execute(inputDto: IConvertMultiInstitutionV1InOrganizationV1InputDto): IOrganizationV1Dto {
    const { multiInstitutionV1Dto, ownerAgentId } = inputDto;

    MultiInstitutionV1Entity.validate(multiInstitutionV1Dto);

    const agentV1Dto = ConvertMultiInstitutionV1InAgentV1Service.execute(multiInstitutionV1Dto);
    const id = hashIntegerAndEntityNameIntoValidObjectId(multiInstitutionV1Dto.id, 'MultiInstitutionV1');
    const agentId = hashIntegerAndEntityNameIntoValidFirebaseUID(multiInstitutionV1Dto.id, 'MultiInstitutionV1');

    const convertedOrganizationV1Dto: IOrganizationV1Dto = {
      id,
      ownerAgentId: ownerAgentId,
      agentId: agentId,
      email: agentV1Dto.email,
      nickname: stringToSlug(multiInstitutionV1Dto.sigla + '-' + id),
      planSubscriptionName: 'FREE',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    return convertedOrganizationV1Dto;
  }
}
