import { hashIntegerAndEntityNameIntoValidFirebaseUID } from '@peerlab/kernel/shared-ts-utils/crypto/hash-integer-and-entity-name-into-valid-firebase-id';
import { hashIntegerAndEntityNameIntoValidObjectId } from '@peerlab/kernel/shared-ts-utils/crypto/hash-integer-and-entity-name-into-valid-object-id';
import { stringToSlug } from '@peerlab/kernel/shared-ts-utils/string-to-slug';
import { IOrganizationV1Dto } from '../../../../organizations-v1/core/entity';
import { MultiDepartmentV1Entity } from '../../entity';
import { ConvertMultiDepartmentV1InAgentV1Service } from '../convert-multi-department-v1-in-agent-v1';
import { IConvertMultiDepartmentV1InOrganizationV1InputDto } from './dto';

export class ConvertMultiDepartmentV1InOrganizationV1Service {
  static execute(inputDto: IConvertMultiDepartmentV1InOrganizationV1InputDto): IOrganizationV1Dto {
    const { multiDepartmentV1Dto, ownerAgentId } = inputDto;

    MultiDepartmentV1Entity.validate(multiDepartmentV1Dto);

    const agentV1Dto = ConvertMultiDepartmentV1InAgentV1Service.execute(multiDepartmentV1Dto);
    const id = hashIntegerAndEntityNameIntoValidObjectId(multiDepartmentV1Dto.id, 'MultiDepartmentV1');
    const agentId = hashIntegerAndEntityNameIntoValidFirebaseUID(multiDepartmentV1Dto.id, 'MultiDepartmentV1');

    const convertedOrganizationV1Dto: IOrganizationV1Dto = {
      id,
      ownerAgentId: ownerAgentId,
      agentId: agentId,
      email: agentV1Dto.email,
      nickname: stringToSlug(multiDepartmentV1Dto.nome + '-' + id),
      planSubscriptionName: 'FREE',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    return convertedOrganizationV1Dto;
  }
}
