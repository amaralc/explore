import { Static, Type } from '@sinclair/typebox';
import 'reflect-metadata';
import { getDtoFromEntity } from '../../../utils/get-dto-from-entity';
import { CustomEnum } from '../../../utils/types/custom-enum';
import { schemaValidator } from '../../../utils/validators/json-schema-validator';

export const organizationV1JsonSchema = Type.Object({
  id: Type.String({
    minLength: 24,
    maxLength: 24,
    pattern: '^[0-9a-fA-F]{24}$',
    description: 'The unique identifier of an agent as a hexadecimal string of 28 characters.',
  }),
  nickname: Type.String({
    minLength: 4,
    description: 'The nickname of the agent. It must have at least 4 characters.',
  }),
  email: Type.String({
    format: 'email',
    description:
      'The email of the organization. An organization agent can have the same e-mail of its owner only if its owner is an individual agent. Two organizations cannot have the same e-mail.',
  }),
  ownerAgentId: Type.String({
    minLength: 24,
    maxLength: 28,
    pattern: '^[A-Za-z0-9]{24,28}$', // BBetween  24 and 28 characters, alphanumeric
    description:
      'The unique identifier of the agent that owns the organization, as a hexadecimal string of 28 characters.',
  }),
  planSubscriptionName: CustomEnum(['FREE'], {
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

export type IOrganizationV1Dto = Static<typeof organizationV1JsonSchema>;

export class OrganizationV1Entity {
  id: string;
  nickname: string;
  email: string;
  ownerAgentId: string;
  planSubscriptionName: IOrganizationV1Dto['planSubscriptionName'];
  createdAt: string;
  updatedAt: string;

  constructor(inputDto: IOrganizationV1Dto) {
    // Validate
    OrganizationV1Entity.validate(inputDto);
    Object.assign(this, inputDto);
  }

  static validate(inputDto: IOrganizationV1Dto) {
    schemaValidator.validateOrReject(organizationV1JsonSchema, inputDto);
  }

  getDto(): IOrganizationV1Dto {
    const dto = getDtoFromEntity<IOrganizationV1Dto, OrganizationV1Entity>(this);
    return dto;
  }
}
