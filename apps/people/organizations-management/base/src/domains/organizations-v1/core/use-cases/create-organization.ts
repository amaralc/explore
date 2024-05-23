import { schemaValidator } from '@peerlab/kernel/shared-ts-utils/validators/json-schema-validator';
import { Static, Type } from '@sinclair/typebox';
import { AgentsV1DatabaseRepository } from '../../../agents-v1/core/database-repository';
import { AgentV1Entity } from '../../../agents-v1/core/entity';
import { OrganizationsV1DatabaseRepository } from '../database-repository';
import { IOrganizationV1Dto, OrganizationV1Entity, organizationV1JsonSchema } from '../entity';

export const createOrgaNizationV1InputDtoSchema = Type.Object({
  nickname: organizationV1JsonSchema.properties.nickname,
  ownerAgentId: organizationV1JsonSchema.properties.ownerAgentId,
  email: organizationV1JsonSchema.properties.email,
  planSubscriptionName: organizationV1JsonSchema.properties.planSubscriptionName, // If it wasn't for the CustomEnum I could use Type.Pick
});

export type CreateOrganizationV1InputDto = Static<typeof createOrgaNizationV1InputDtoSchema>;

export class CreateOrganizationV1UseCase {
  private organizationsV1Repository: OrganizationsV1DatabaseRepository;
  private agentsV1Repository: AgentsV1DatabaseRepository;

  constructor(
    organizationsV1Repository: OrganizationsV1DatabaseRepository,
    agentsV1Repository: AgentsV1DatabaseRepository,
  ) {
    this.organizationsV1Repository = organizationsV1Repository;
    this.agentsV1Repository = agentsV1Repository;
  }

  public async execute(inputDto: CreateOrganizationV1InputDto): Promise<IOrganizationV1Dto> {
    // Validate
    schemaValidator.validateOrReject(createOrgaNizationV1InputDtoSchema, inputDto);

    const ownerAgent = await this.agentsV1Repository.getAgentById(inputDto.ownerAgentId);
    if (!ownerAgent) {
      throw new Error('Owner not found');
    }

    const organizationWithSameNickname = await this.organizationsV1Repository.findByNickname(inputDto.nickname);
    if (organizationWithSameNickname !== null) {
      throw new Error('Organization with same nickname already exists');
    }

    const individualAgentWithSameEmail = await this.agentsV1Repository.getByEmailAndType(inputDto.email, 'INDIVIDUAL');
    if (individualAgentWithSameEmail && individualAgentWithSameEmail.id !== inputDto.ownerAgentId) {
      throw new Error('Another individual agent with same email already exists. Please use another email.');
    }

    const ownerOrganizations = await this.organizationsV1Repository.getOrganizationsByOwnerId(inputDto.ownerAgentId);
    if (ownerOrganizations.some((organization) => organization.planSubscriptionName === 'FREE')) {
      throw new Error('Owner agent already have a free organization');
    }

    const organizationAgent = new AgentV1Entity({
      id: this.agentsV1Repository.generateUniqueId(),
      nickname: inputDto.nickname,
      email: inputDto.email,
      type: 'ORGANIZATION',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    await this.agentsV1Repository.create(organizationAgent);

    const organizationV1Entity = new OrganizationV1Entity({
      id: this.organizationsV1Repository.generateUniqueId(),
      nickname: inputDto.nickname,
      ownerAgentId: ownerAgent.id,
      agentId: organizationAgent.id,
      email: inputDto.email,
      planSubscriptionName: inputDto.planSubscriptionName,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    const organization = await this.organizationsV1Repository.create(organizationV1Entity);
    return organization;
  }
}
