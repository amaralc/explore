import { getDtoFromEntity } from '@peerlab/kernel/shared-ts-utils/get-dto-from-entity';
import { CustomEnum } from '@peerlab/kernel/shared-ts-utils/types/custom-enum';
import { schemaValidator } from '@peerlab/kernel/shared-ts-utils/validators/json-schema-validator';
import { Static, Type } from '@sinclair/typebox';
import { randomBytes } from 'crypto';

export const agentV1JsonSchema = Type.Object({
  id: Type.String({
    minLength: 28,
    maxLength: 28,
    pattern: '^[A-Za-z0-9]{28}$',
    description: 'The unique identifier of an agent as a hexadecimal string of 28 characters.',
  }),
  nickname: Type.String({
    minLength: 4,
    pattern: '^(?:[a-z0-9]+(?:-[a-z0-9]+)*){4,}$', // Starts with a letter or number, followed by letters, numbers or hyphens, and ends with a letter or number with more 4 characters or more
    description: 'The nickname of the agent. It must have at least 4 characters.',
  }),
  email: Type.String({
    format: 'email',
    description:
      'The email of the agent. An organization agent can have the same e-mail of its owner only if its owner is an individual agent. Two individual agents cannot have the same e-mail.',
  }),
  type: CustomEnum(['INDIVIDUAL', 'ORGANIZATION'], {
    description: 'The type of the agent. It can be individual or organization.',
  }),
  createdAt: Type.String({
    format: 'date-time',
    description: 'The date and time when the agent was created.',
    pattern: '^[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}:[0-9]{2}.[0-9]{3}Z$',
  }),
  updatedAt: Type.String({
    format: 'date-time',
    description: 'The date and time when the agent was last updated.',
    pattern: '^[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}:[0-9]{2}.[0-9]{3}Z$',
  }),
});

export type IAgentV1Dto = Static<typeof agentV1JsonSchema>;

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
    const emailSchema = Type.String({ format: 'email' });
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
