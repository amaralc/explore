import { ILogMetadata } from '@peerlab/kernel/shared-ts-utils/logs/application-logger';
import { winstonLogger } from '@peerlab/kernel/shared-ts-utils/logs/winston-logger';
import { schemaValidator } from '@peerlab/kernel/shared-ts-utils/validators/json-schema-validator';
import { Static, Type } from '@sinclair/typebox';
import { AgentsV1DatabaseRepository } from '../../../../agents-v1/core/database-repository';
import { AgentV1Entity } from '../../../../agents-v1/core/entity';
import { OrganizationsV1DatabaseRepository } from '../../database-repository';
import { IOrganizationV1Dto, OrganizationV1Entity, organizationV1JsonSchema } from '../../entity';
import { OwnerAgentNotFoundError } from '../../errors';
import {
  DuplicatedIndividualAgentEmailError,
  DuplicatedOrganizationNicknamesError,
  FreeOrganizationLimitReachedError,
} from './errors';

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
    const log: ILogMetadata = {
      scope: {
        moduleName: CreateOrganizationV1UseCase.name,
        methodName: 'execute',
      },
      steps: [],
    };
    try {
      // Validate
      log.steps.push({ message: 'Validate createOrganizationV1InputDto' });
      schemaValidator.validateOrReject(createOrgaNizationV1InputDtoSchema, inputDto);

      log.steps.push({ message: 'Find agent by id', metadata: { agentId: inputDto.ownerAgentId } });
      const ownerAgent = await this.agentsV1Repository.getAgentById(inputDto.ownerAgentId);
      if (!ownerAgent) {
        throw new OwnerAgentNotFoundError(`Owner agent with id ${inputDto.ownerAgentId} not found`);
      }

      log.steps.push({ message: 'Find organization by nickname', metadata: { agentId: inputDto.nickname } });
      const organizationWithSameNickname = await this.organizationsV1Repository.findByNickname(inputDto.nickname);
      if (organizationWithSameNickname !== null) {
        throw new DuplicatedOrganizationNicknamesError();
      }

      log.steps.push({ message: 'Find individual agent with same email' }); // E-mail should not be logged due to privacy
      const individualAgentWithSameEmail = await this.agentsV1Repository.getByEmailAndType(
        inputDto.email,
        'INDIVIDUAL',
      );

      if (individualAgentWithSameEmail && individualAgentWithSameEmail.id !== inputDto.ownerAgentId) {
        throw new DuplicatedIndividualAgentEmailError();
      }

      log.steps.push({ message: 'Check if owner agent already have a free organization' });
      const ownerOrganizations = await this.organizationsV1Repository.getOrganizationsByOwnerId(inputDto.ownerAgentId);
      if (ownerOrganizations.some((organization) => organization.planSubscriptionName === 'FREE')) {
        throw new FreeOrganizationLimitReachedError();
      }

      log.steps.push({ message: 'Create organization agent entity' });
      const organizationAgent = new AgentV1Entity({
        id: this.agentsV1Repository.generateUniqueId(),
        nickname: inputDto.nickname,
        email: inputDto.email,
        type: 'ORGANIZATION',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });

      // Verify if ownerAgent is an organization agent and if so get its organization idPath
      let ownerOrganizationIdPath: string | null = null;
      if (ownerAgent.type === 'ORGANIZATION') {
        log.steps.push({ message: 'Owner agent is an organization agent' });
        const ownerOrganization = await this.organizationsV1Repository.findByAgentId(ownerAgent.id);
        ownerOrganizationIdPath = ownerOrganization.idPath;
      }

      log.steps.push({ message: 'Create organization entity' });
      const newOrganizationId = this.organizationsV1Repository.generateUniqueId();
      const organizationV1Entity = new OrganizationV1Entity({
        id: newOrganizationId,
        nickname: inputDto.nickname,
        ownerAgentId: ownerAgent.id,
        agentId: organizationAgent.id,
        email: inputDto.email,
        planSubscriptionName: inputDto.planSubscriptionName,
        idPath: ownerOrganizationIdPath ? `${ownerOrganizationIdPath}/${newOrganizationId}` : `/${newOrganizationId}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });

      log.steps.push({ message: 'Save organization agent and organization' });
      await this.agentsV1Repository.create(organizationAgent);
      const organization = await this.organizationsV1Repository.create(organizationV1Entity);

      winstonLogger.info('Organization created', log);
      return organization;
    } catch (error) {
      winstonLogger.error('Error creating organization', log);
      throw error;
    }
  }
}
