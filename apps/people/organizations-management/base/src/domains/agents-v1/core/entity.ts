import { getDtoFromEntity } from '@peerlab/kernel/shared-ts-utils/get-dto-from-entity';
import { schemaValidator } from '@peerlab/kernel/shared-ts-utils/validators/json-schema';
import { randomBytes } from 'crypto';
import { JSONSchema } from 'json-schema-to-typescript';
import agentV1JsonSchema from './entity.schema';
import { IAgentV1Dto } from './entity.schema.types';

export class AgentV1Entity {
  id: string;
  nickname: string;
  email: string;
  type: IAgentV1Dto['type'];
  createdAt: string;
  updatedAt: string;

  constructor(inputDto: IAgentV1Dto) {
    AgentV1Entity.validate(inputDto);
    Object.assign(this, inputDto);
  }

  static validate(inputDto: IAgentV1Dto) {
    schemaValidator.validateOrReject(agentV1JsonSchema, inputDto);
  }

  static generateNicknameFromEmail(email: string) {
    const emailSchema = { format: 'email', type: 'string' } as const satisfies JSONSchema;
    schemaValidator.validateOrReject(emailSchema, email);

    // Get email prefix
    const emailPrefix = email.split('@')[0];

    // Normalize the string to decompose combined graphemes
    const normalized = emailPrefix.normalize('NFD');

    // Replace characters which are not non-spacing marks
    const withoutDiacritics = normalized.replace(/[\p{M}]/gu, '');

    // Convert special characters to "-", then remove consecutive "-" and trim
    const withHyphens = withoutDiacritics
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '-') // Convert special characters to "-"
      .replace(/[\s_]+/g, '-') // Convert spaces and underscores to "-"
      .replace(/-+/g, '-'); // Replace multiple consecutive "-" with a single "-"

    // Add random characters
    const withRandomCharacters = withHyphens + '-' + randomBytes(8).toString('hex');
    return withRandomCharacters;
  }

  getDto(): IAgentV1Dto {
    const dto = getDtoFromEntity<IAgentV1Dto>(this);
    return dto;
  }
}
