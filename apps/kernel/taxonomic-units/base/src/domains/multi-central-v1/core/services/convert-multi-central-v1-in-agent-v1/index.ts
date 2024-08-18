import { hashIntegerAndEntityNameIntoValidFirebaseUID } from '@peerlab/kernel/shared-ts-utils/crypto/hash-integer-and-entity-name-into-valid-firebase-id';
import { stringToSlug } from '@peerlab/kernel/shared-ts-utils/string-to-slug';
import { AgentV1Entity } from '../../../../agents-v1/core/entity';
import { IAgentV1Dto } from '../../../../agents-v1/core/entity.schema.types';
import { IMultiCentralV1Dto } from '../../entity.schema.types';

export class ConvertMultiCentralV1InAgentV1Service {
  static execute(inputDto: IMultiCentralV1Dto): IAgentV1Dto {
    const id = hashIntegerAndEntityNameIntoValidFirebaseUID(inputDto.id, 'MultiCentralV1');

    const agentV1 = new AgentV1Entity({
      id,
      type: 'ORGANIZATION',
      email: inputDto.email,
      nickname: stringToSlug(inputDto.sigla + '-' + id),
      createdAt: new Date(inputDto.created).toISOString(),
      updatedAt: new Date(inputDto.updated).toISOString(),
    });

    const outputDto = agentV1.getDto();

    return outputDto;
  }
}
