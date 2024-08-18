import { ILogMetadata } from '@peerlab/kernel/shared-ts-utils/logs/application-logger';
import { winstonLogger } from '@peerlab/kernel/shared-ts-utils/logs/winston-logger';
import { AgentsV1DatabaseRepository } from '../../../../agents-v1/core/database-repository';
import { IAgentV1Dto } from '../../../../agents-v1/core/entity.schema.types';
import { MultiCentralsV1DatabaseRepository } from '../../../../multi-central-v1/core/database-repository';
import { ConvertMultiCentralV1InAgentV1Service } from '../../../../multi-central-v1/core/services/convert-multi-central-v1-in-agent-v1';
import { ConvertMultiCentralV1InOrganizationV1Service } from '../../../../multi-central-v1/core/services/convet-multi-central-v1-in-organization-v1';
import { ExtractMultiDepartmentsV1FromMultiCentralsV1Service } from '../../../../multi-central-v1/core/services/extract-multi-departments-v1-from-multi-centrals-v1';
import { ExtractMultiUnitsV1FromMultiCentralsV1Service } from '../../../../multi-central-v1/core/services/extract-multi-units-v1-from-multi-centrals-v1';
import { ConvertMultiDepartmentV1InAgentV1Service } from '../../../../multi-department-v1/core/services/convert-multi-department-v1-in-agent-v1';
import { ConvertMultiDepartmentV1InOrganizationV1Service } from '../../../../multi-department-v1/core/services/convert-multi-department-v1-in-organization-v1';
import { MultiInstitutionsV1DatabaseRepository } from '../../../../multi-institution-v1/core/database-repository';
import { ConvertMultiInstitutionV1InAgentV1Service } from '../../../../multi-institution-v1/core/services/convert-multi-institution-v1-in-agent-v1';
import { ConvertMultiInstitutionV1InOrganizationV1Service } from '../../../../multi-institution-v1/core/services/convert-multi-institution-v1-in-organization-v1';
import { ConvertMultiUnitV1InAgentV1Service } from '../../../../multi-unit-v1/core/services/convert-multi-unit-v1-in-agent-v1';
import { ConvertMultiUnitV1InOrganizationV1Service } from '../../../../multi-unit-v1/core/services/convert-multi-unit-v1-in-organization-v1';
import { OrganizationsV1DatabaseRepository } from '../../../../taxonomic-unit-v1/core/database-repository';
import { IExtractEntitiesFromExternalSourceUseCaseOutputDto } from './dto';
import {
  DuplicatedAgentIdsError,
  DuplicatedAgentNicknamesError,
  DuplicatedOrganizationIdsError,
  DuplicatedOrganizationNicknamesError,
  TemporaryAccountHolderNotFoundError,
} from './errors';

export class ExtractEntitiesFromExternalSourceUseCase {
  constructor(
    private readonly multiInstitutionsV1DatabaseRepository: MultiInstitutionsV1DatabaseRepository,
    private readonly multiCentralsV1DatabaseRepository: MultiCentralsV1DatabaseRepository,
    private readonly agentsV1DatabaseRepository: AgentsV1DatabaseRepository,
    private readonly organizationsV1DatabaseRepository: OrganizationsV1DatabaseRepository,
  ) {}

  async execute(accountHolderAgentId: IAgentV1Dto['id']): Promise<IExtractEntitiesFromExternalSourceUseCaseOutputDto> {
    const log: ILogMetadata = {
      scope: { moduleName: ExtractEntitiesFromExternalSourceUseCase.name, methodName: 'listAll' },
      steps: [],
    };
    try {
      log.steps.push({ message: 'Get temporary accounts holder' });
      const accountHolder = await this.agentsV1DatabaseRepository.getAgentById(accountHolderAgentId);
      if (!accountHolder) {
        throw new TemporaryAccountHolderNotFoundError('Could not find an account holder for the input agent nickname');
      }

      log.steps.push({ message: 'List multi entities from external source' });
      const multiInstitutionsV1Dto = await this.multiInstitutionsV1DatabaseRepository.listAll();

      log.steps.push({ message: 'List multi centrals from external source' });
      const multiCentralsV1 = await this.multiCentralsV1DatabaseRepository.listAll();

      log.steps.push({ message: 'Extract multi units and departments from multi centrals' });
      const multiUnitsV1 = ExtractMultiUnitsV1FromMultiCentralsV1Service.execute(multiCentralsV1);
      const multiDepartmentsV1 = ExtractMultiDepartmentsV1FromMultiCentralsV1Service.execute(multiCentralsV1);

      const extractedMultiEntities: IExtractEntitiesFromExternalSourceUseCaseOutputDto = {
        extractedCentralsCount: multiCentralsV1.length,
        extractedDepartmentsCount: multiDepartmentsV1.length,
        extractedInstitutionsCount: multiInstitutionsV1Dto.length,
        extractedUnitsCount: multiUnitsV1.length,
      };
      log.steps.push({ message: 'Multi entities extracted from external source', metadata: extractedMultiEntities });

      log.steps.push({ message: 'Convert multi entities in agents v1' });
      const agentsV1FromMultiInstitutionsV1Dto = multiInstitutionsV1Dto.map(
        ConvertMultiInstitutionV1InAgentV1Service.execute,
      );
      const agentsV1FromMultiCentralsV1 = multiCentralsV1.map(ConvertMultiCentralV1InAgentV1Service.execute);
      const agentsV1FromMultiUnitsV1 = multiUnitsV1.map(ConvertMultiUnitV1InAgentV1Service.execute);
      const agentsV1FromMultiDepartmentsV1 = multiDepartmentsV1.map(ConvertMultiDepartmentV1InAgentV1Service.execute);

      log.steps.push({ message: 'Convert multi entities in organizations v1' });
      const organizationsV1FromMultiInstitutionsV1Dto = multiInstitutionsV1Dto.map((multiInstitutionV1Dto) => {
        return ConvertMultiInstitutionV1InOrganizationV1Service.execute({
          ownerAgentId: accountHolder.id,
          multiInstitutionV1Dto,
        });
      });

      const organizationsV1FromMultiCentralsV1 = multiCentralsV1.map(
        ConvertMultiCentralV1InOrganizationV1Service.execute,
      );
      const organizationsV1FromMultiUnitsV1 = multiUnitsV1.map(ConvertMultiUnitV1InOrganizationV1Service.execute);
      const organizationsV1FromMultiDepartmentsV1 = multiDepartmentsV1.map(
        ConvertMultiDepartmentV1InOrganizationV1Service.execute,
      );

      log.steps.push({ message: 'Combine agents from external source' });
      const agentsV1DtoList = [
        ...agentsV1FromMultiInstitutionsV1Dto,
        ...agentsV1FromMultiUnitsV1,
        ...agentsV1FromMultiCentralsV1,
        ...agentsV1FromMultiDepartmentsV1,
      ];

      const uniqueAgentIds = new Set(agentsV1DtoList.map((item) => item.id));
      if (uniqueAgentIds.size !== agentsV1DtoList.length) {
        throw new DuplicatedAgentIdsError('Duplicate IDs found in agents data');
      }

      const uniqueAgentNicknames = new Set(agentsV1DtoList.map((item) => item.nickname));
      if (uniqueAgentNicknames.size !== agentsV1DtoList.length) {
        throw new DuplicatedAgentNicknamesError('Duplicate nicknames found in agents data');
      }

      log.steps.push({ message: 'Combine organizations from external source' });
      const organizationsV1DtoList = [
        ...organizationsV1FromMultiInstitutionsV1Dto,
        ...organizationsV1FromMultiUnitsV1,
        ...organizationsV1FromMultiCentralsV1,
        ...organizationsV1FromMultiDepartmentsV1,
      ];

      const uniqueOrganizationIds = new Set(agentsV1DtoList.map((item) => item.id));
      if (uniqueOrganizationIds.size !== agentsV1DtoList.length) {
        throw new DuplicatedOrganizationIdsError('Duplicate IDs found in organizations data');
      }

      const uniqueOrganizationNicknames = new Set(agentsV1DtoList.map((item) => item.nickname));
      if (uniqueOrganizationNicknames.size !== agentsV1DtoList.length) {
        throw new DuplicatedOrganizationNicknamesError('Duplicate nicknames found in organizations data');
      }

      const agentsByEmail = agentsV1DtoList.reduce((acc, item) => {
        acc[item.email] = acc[item.email] + 1 || 1;
        return acc;
      }, {});

      const organizationsByEmail = organizationsV1DtoList.reduce((acc, item) => {
        acc[item.email] = acc[item.email] + 1 || 1;
        return acc;
      }, {});

      log.steps.push({
        message: 'Create agents from external source',
        metadata: {
          agentsCount: agentsV1DtoList.length,
          agentsByEmail,
        },
      });

      const agentsBatchResult = await this.agentsV1DatabaseRepository.upsertMany(agentsV1DtoList);

      log.steps.push({
        message: 'Agents created',
        metadata: {
          upsertedAgentCount: agentsBatchResult.upsertedCount,
          upsertedAgentIds: agentsBatchResult.upsertedIds,
          insertedAgentCount: agentsBatchResult.insertedCount,
          insertedAgentIds: agentsBatchResult.insertedIds,
        },
      });

      log.steps.push({
        message: 'Create organizations from external source',
        metadata: {
          organizationsCount: organizationsV1DtoList.length,
          organizationsByEmail,
        },
      });

      const organizationsBatchResult = await this.organizationsV1DatabaseRepository.upsertMany(organizationsV1DtoList);
      log.steps.push({
        message: 'Organizations created',
        metadata: {
          upsertedAgentCount: organizationsBatchResult.upsertedCount,
          upsertedAgentIds: organizationsBatchResult.upsertedIds,
          insertedAgentCount: organizationsBatchResult.insertedCount,
          insertedAgentIds: organizationsBatchResult.insertedIds,
        },
      });

      winstonLogger.info('Success populating agents and organizations from external source', log);
      return extractedMultiEntities;
    } catch (error) {
      log.steps.push({ message: 'Error seeding database from external source.', metadata: { error: error.stack } });
      winstonLogger.error(`Error seeding database from external source: ${error.message}`, log);
      throw error;
    }
  }
}
