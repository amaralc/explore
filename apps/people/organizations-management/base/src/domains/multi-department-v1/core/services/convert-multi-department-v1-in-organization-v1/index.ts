import { hashIntegerAndEntityNameIntoValidFirebaseUID } from '@peerlab/kernel/shared-ts-utils/crypto/hash-integer-and-entity-name-into-valid-firebase-id';
import { hashIntegerAndEntityNameIntoValidObjectId } from '@peerlab/kernel/shared-ts-utils/crypto/hash-integer-and-entity-name-into-valid-object-id';
import { stringToSlug } from '@peerlab/kernel/shared-ts-utils/string-to-slug';
import { IOrganizationV1Dto } from '../../../../organizations-v1/core/entity';
import { MultiDepartmentV1Entity } from '../../entity';
import { ConvertMultiDepartmentV1InAgentV1Service } from '../convert-multi-department-v1-in-agent-v1';
import { IConvertMultiDepartmentV1InOrganizationV1InputDto } from './dto';

export class ConvertMultiDepartmentV1InOrganizationV1Service {
  static execute(inputDto: IConvertMultiDepartmentV1InOrganizationV1InputDto): IOrganizationV1Dto {
    MultiDepartmentV1Entity.validate(inputDto);

    const institutionOrganizationV1Id = hashIntegerAndEntityNameIntoValidObjectId(
      inputDto.instituicao_id,
      'MultiInstitutionV1',
    );
    const agentV1Dto = ConvertMultiDepartmentV1InAgentV1Service.execute(inputDto);
    const departmentOrganizationV1Id = hashIntegerAndEntityNameIntoValidObjectId(inputDto.id, 'MultiDepartmentV1');
    const agentId = hashIntegerAndEntityNameIntoValidFirebaseUID(inputDto.id, 'MultiDepartmentV1');
    const ownerAgentId = hashIntegerAndEntityNameIntoValidFirebaseUID(inputDto.unidade_id, 'MultiUnitV1');
    const unitOrganizationV1Id = hashIntegerAndEntityNameIntoValidObjectId(inputDto.unidade_id, 'MultiUnitV1');

    const departmentOrganizationV1IdPath = `/${institutionOrganizationV1Id}/${unitOrganizationV1Id}/${departmentOrganizationV1Id}`;

    const convertedOrganizationV1Dto: IOrganizationV1Dto = {
      id: departmentOrganizationV1Id,
      ownerAgentId,
      agentId: agentId,
      email: agentV1Dto.email,
      nickname: stringToSlug(inputDto.nome + '-' + departmentOrganizationV1Id),
      planSubscriptionName: 'FREE',
      idPath: departmentOrganizationV1IdPath,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    return convertedOrganizationV1Dto;
  }
}
