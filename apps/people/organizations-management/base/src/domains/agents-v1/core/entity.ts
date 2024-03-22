import { Static, Type } from '@sinclair/typebox';
import { getDtoFromEntity } from '../../../utils/get-dto-from-entity';
import { CustomEnum } from '../../../utils/types/custom-enum';
import { schemaValidator } from '../../../utils/validators/json-schema-validator';

export const agentV1JsonSchema = Type.Object({
  id: Type.String({
    minLength: 28,
    maxLength: 28,
    pattern: '^[A-Za-z0-9]{28}$',
    description: 'The unique identifier of an agent as a hexadecimal string of 28 characters.',
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

  getDto(): IAgentV1Dto {
    const dto = getDtoFromEntity<IAgentV1Dto, AgentV1Entity>(this);
    return dto;
  }
}
