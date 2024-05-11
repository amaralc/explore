import { hashIntegerIntoValidFirebaseUID } from '@peerlab/kernel/shared-ts-utils/crypto/hash-integer-into-valid-firebase-id';
import { stringToSlug } from '@peerlab/kernel/shared-ts-utils/string-to-slug';
import { AgentV1Entity, IAgentV1Dto } from '../../../../agents-v1/core/entity';
import { IConvertMultiInstitutionV1InAgentV1InputDto } from './dto';

export class ConvertMultiInstitutionV1InAgentV1Service {
  static execute(inputDto: IConvertMultiInstitutionV1InAgentV1InputDto): IAgentV1Dto {
    const id = hashIntegerIntoValidFirebaseUID(inputDto.id);

    const agentV1 = new AgentV1Entity({
      id,
      type: 'ORGANIZATION',
      email: 'placeholder-' + id + '@email.com', // TODO: get actual institution emails
      nickname: stringToSlug(inputDto.sigla + '-' + id),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    const outputDto = agentV1.getDto();

    return outputDto;
  }
}
