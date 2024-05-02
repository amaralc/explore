import { faker } from '@faker-js/faker';
import { stringToSlug } from '@peerlab/kernel/shared-ts-utils/string-to-slug';
import { randomBytes } from 'crypto';
import { IAgentV1Dto } from '../../entity';
import { IConvertMultiInstitutionV1InAgentV1InputDto } from './input.dto';

export class ConvertMultiInstitutionV1InAgentV1Service {
  static execute(inputDto: IConvertMultiInstitutionV1InAgentV1InputDto): IAgentV1Dto {
    const { id, multiInstitutionV1Dto } = inputDto;

    const slugId = randomBytes(12).toString('hex');

    const outputDto: IAgentV1Dto = {
      id,
      type: 'ORGANIZATION',
      email: faker.internet.email(), // TODO: get actual emails
      nickname: stringToSlug(multiInstitutionV1Dto.sigla + '-' + slugId),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    return outputDto;
  }
}
