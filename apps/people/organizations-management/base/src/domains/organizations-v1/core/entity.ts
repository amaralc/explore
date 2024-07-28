import { ValidationExceptionV2Error } from '@peerlab/kernel/shared-ts-utils/errors/validation-exception-v1';
import { getDtoFromEntity } from '@peerlab/kernel/shared-ts-utils/get-dto-from-entity';
import { CustomEnum } from '@peerlab/kernel/shared-ts-utils/types/custom-enum';
import { schemaValidator } from '@peerlab/kernel/shared-ts-utils/validators/json-schema-validator';
import { Static, Type } from '@sinclair/typebox';
import 'reflect-metadata';
import { agentV1JsonSchema } from '../../agents-v1/core/entity';

export const organizationV1JsonSchema = Type.Object({
  id: Type.String({
    minLength: 24,
    maxLength: 24,
    pattern: '^[0-9a-fA-F]{24}$',
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
      'The email of the organization. An organization agent can have the same e-mail of its owner only if its owner is an individual agent. Two organizations cannot have the same e-mail.',
  }),
  agentId: agentV1JsonSchema.properties.id,
  ownerAgentId: Type.String({
    minLength: agentV1JsonSchema.properties.id.minLength,
    maxLength: agentV1JsonSchema.properties.id.maxLength,
    pattern: agentV1JsonSchema.properties.id.pattern, // Between  24 and 28 characters, alphanumeric
    description:
      'The unique identifier of the agent that owns the organization, as a hexadecimal string of 28 characters.',
  }),
  planSubscriptionName: CustomEnum(['FREE'], {
    description: 'The type of the agent. It can be individual or organization.',
  }),
  idPath: Type.String({
    description: 'The path of the organization in the hierarchy.',
    pattern: '^/([0-9a-fA-F]{24})(?:/([0-9a-fA-F]{24}))*$', // Starts with a slash, followed by a hexadecimal string of 24 characters, and can have more hexadecimal strings of 24 characters separated by slashes
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

export type IOrganizationV1Dto = Static<typeof organizationV1JsonSchema>;

export class OrganizationV1Entity {
  id: string;
  nickname: string;
  email: string;
  agentId: string;
  ownerAgentId: string;
  planSubscriptionName: IOrganizationV1Dto['planSubscriptionName'];
  idPath: string;
  createdAt: string;
  updatedAt: string;

  constructor(inputDto: IOrganizationV1Dto) {
    // Validate
    OrganizationV1Entity.validate(inputDto);
    Object.assign(this, inputDto);
  }

  static validate(inputDto: IOrganizationV1Dto) {
    schemaValidator.validateOrReject(organizationV1JsonSchema, inputDto);
    OrganizationV1Entity.validateIdPath(inputDto);
  }

  getDto(): IOrganizationV1Dto {
    const dto = getDtoFromEntity<IOrganizationV1Dto>(this);
    return dto;
  }

  getIdPathArray(): Array<string> {
    return this.idPath.split('/').filter((id) => id !== '');
  }

  static validateIdPath(inputDto: IOrganizationV1Dto) {
    const endsWithId = inputDto.idPath.endsWith(inputDto.id);
    if (!endsWithId) {
      throw new ValidationExceptionV2Error([
        {
          message: 'should end with the organization id',
          keyword: 'idPath',
          instancePath: 'idPath',
          schemaPath: '/idPath',
          params: {},
        },
      ]);
    }
  }
}
