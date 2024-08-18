import { hashIntegerAndEntityNameIntoValidFirebaseUID } from '@peerlab/kernel/shared-ts-utils/crypto/hash-integer-and-entity-name-into-valid-firebase-id';
import { hashIntegerAndEntityNameIntoValidObjectId } from '@peerlab/kernel/shared-ts-utils/crypto/hash-integer-and-entity-name-into-valid-object-id';
import { stringToSlug } from '@peerlab/kernel/shared-ts-utils/string-to-slug';
import { IOrganizationV1Dto } from '../../../../taxonomic-unit-v1/core/entity.schema.types';
import { IMultiCentralV1Dto } from '../../entity.schema.types';

export class ConvertMultiCentralV1InOrganizationV1Service {
  static execute(inputDto: IMultiCentralV1Dto): IOrganizationV1Dto {
    const id = hashIntegerAndEntityNameIntoValidObjectId(inputDto.id, 'MultiCentralV1');
    const agentId = hashIntegerAndEntityNameIntoValidFirebaseUID(inputDto.id, 'MultiCentralV1');

    const institutionId = inputDto.instituicao_id;
    const institutionOrganizationV1Id = hashIntegerAndEntityNameIntoValidObjectId(institutionId, 'MultiInstitutionV1');

    const unitId = inputDto.unidade_id;
    const unitAgentId = hashIntegerAndEntityNameIntoValidFirebaseUID(unitId, 'MultiUnitV1');
    const unitOrganizationV1Id = hashIntegerAndEntityNameIntoValidObjectId(unitId, 'MultiUnitV1');
    let ownerAgentId = unitAgentId;

    let centralOrganizationV1IdPath = `/${institutionOrganizationV1Id}/${unitOrganizationV1Id}/${id}`;

    const departmentId = inputDto.departamento_id;
    if (departmentId) {
      const departmentAgentId = hashIntegerAndEntityNameIntoValidFirebaseUID(departmentId, 'MultiDepartmentV1');
      const departmentOrganizationV1Id = hashIntegerAndEntityNameIntoValidObjectId(departmentId, 'MultiDepartmentV1');
      ownerAgentId = departmentAgentId;
      centralOrganizationV1IdPath = `/${institutionOrganizationV1Id}/${unitOrganizationV1Id}/${departmentOrganizationV1Id}/${id}`;
    }

    const convertedOrganizationV1Dto: IOrganizationV1Dto = {
      id,
      ownerAgentId,
      agentId: agentId,
      email: inputDto.email,
      nickname: stringToSlug(inputDto.sigla + '-' + id),
      planSubscriptionName: 'FREE',
      idPath: centralOrganizationV1IdPath,
      createdAt: new Date(inputDto.created).toISOString(),
      updatedAt: new Date(inputDto.updated).toISOString(),
    };

    return convertedOrganizationV1Dto;
  }
}
