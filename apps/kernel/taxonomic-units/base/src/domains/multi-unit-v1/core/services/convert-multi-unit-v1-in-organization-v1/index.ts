import { hashIntegerAndEntityNameIntoValidFirebaseUID } from '@peerlab/kernel/shared-ts-utils/crypto/hash-integer-and-entity-name-into-valid-firebase-id';
import { hashIntegerAndEntityNameIntoValidObjectId } from '@peerlab/kernel/shared-ts-utils/crypto/hash-integer-and-entity-name-into-valid-object-id';
import { stringToSlug } from '@peerlab/kernel/shared-ts-utils/string-to-slug';
import { IOrganizationV1Dto } from '../../../../taxonomic-unit-v1/core/entity.schema.types';
import { MultiUnitV1Entity } from '../../entity';
import { ConvertMultiUnitV1InAgentV1Service } from '../convert-multi-unit-v1-in-agent-v1';
import { IConvertMultiUnitV1InOrganizationV1InputDto } from './dto';

export class ConvertMultiUnitV1InOrganizationV1Service {
  static execute(inputDto: IConvertMultiUnitV1InOrganizationV1InputDto): IOrganizationV1Dto {
    MultiUnitV1Entity.validate(inputDto);

    const agentV1Dto = ConvertMultiUnitV1InAgentV1Service.execute(inputDto);
    const id = hashIntegerAndEntityNameIntoValidObjectId(inputDto.id, 'MultiUnitV1');
    const agentId = hashIntegerAndEntityNameIntoValidFirebaseUID(inputDto.id, 'MultiUnitV1');

    const ownerAgentId = hashIntegerAndEntityNameIntoValidFirebaseUID(inputDto.instituicao_id, 'MultiInstitutionV1');

    const institutionV1OrganizationId = hashIntegerAndEntityNameIntoValidObjectId(
      inputDto.instituicao_id,
      'MultiInstitutionV1',
    );

    const convertedOrganizationV1Dto: IOrganizationV1Dto = {
      id,
      ownerAgentId,
      agentId: agentId,
      email: agentV1Dto.email,
      nickname: stringToSlug(inputDto.sigla + '-' + id),
      planSubscriptionName: 'FREE',
      idPath: `/${institutionV1OrganizationId}/${id}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    return convertedOrganizationV1Dto;
  }
}
