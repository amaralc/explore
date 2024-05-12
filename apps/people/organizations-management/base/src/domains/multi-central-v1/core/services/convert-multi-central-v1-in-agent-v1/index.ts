import { hashIntegerIntoValidFirebaseUID } from '@peerlab/kernel/shared-ts-utils/crypto/hash-integer-into-valid-firebase-id';
import { stringToSlug } from '@peerlab/kernel/shared-ts-utils/string-to-slug';
import { AgentV1Entity, IAgentV1Dto } from '../../../../agents-v1/core/entity';
import { IMultiCentralV1Dto } from '../../entity';

export class ConvertMultiCentralV1InAgentV1Service {
  static execute(inputDto: IMultiCentralV1Dto): IAgentV1Dto {
    const id = hashIntegerIntoValidFirebaseUID(inputDto.id);

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
