import { ILogMetadata } from '@peerlab/kernel/shared-ts-utils/logs/application-logger';
import { nativeLogger } from '@peerlab/kernel/shared-ts-utils/logs/native-logger';
import { AgentsV1DatabaseRepository } from '../../../../agents-v1/core/database-repository';
import { MultiCentralsV1DatabaseRepository } from '../../../../multi-central-v1/core/database-repository';
import { ConvertMultiCentralV1InAgentV1Service } from '../../../../multi-central-v1/core/services/convert-multi-central-v1-in-agent-v1';
import { ConvertMultiCentralV1InOrganizationV1Service } from '../../../../multi-central-v1/core/services/convet-multi-central-v1-in-organization-v1';
import { ExtractMultiDepartmentsV1FromMultiCentralsV1Service } from '../../../../multi-central-v1/core/services/extract-multi-departments-v1-from-multi-centrals-v1';
import { ExtractMultiUnitsV1FromMultiCentralsV1Service } from '../../../../multi-central-v1/core/services/extract-multi-units-v1-from-multi-centrals-v1';
import { ConvertMultiDepartmentV1InAgentV1Service } from '../../../../multi-department-v1/core/services/convert-multi-department-v1-in-agent-v1';
import { MultiInstitutionsV1DatabaseRepository } from '../../../../multi-institution-v1/core/database-repository';
import { ConvertMultiInstitutionV1InAgentV1Service } from '../../../../multi-institution-v1/core/services/convert-multi-institution-v1-in-agent-v1';
import { ConvertMultiInstitutionV1InOrganizationV1Service } from '../../../../multi-institution-v1/core/services/convert-multi-institution-v1-in-organization-v1';
import { ConvertMultiUnitV1InAgentV1Service } from '../../../../multi-unit-v1/core/services/convert-multi-unit-v1-in-agent-v1';
import { OrganizationsV1DatabaseRepository } from '../../../../organizations-v1/core/database-repository';

export class ExtractEntitiesFromExternalSourceUseCase {
  constructor(
    private readonly multiInstitutionsV1DatabaseRepository: MultiInstitutionsV1DatabaseRepository,
    private readonly multiCentralsV1DatabaseRepository: MultiCentralsV1DatabaseRepository,
    private readonly agentsV1DatabaseRepository: AgentsV1DatabaseRepository,
    private readonly organizationsV1DatabaseRepository: OrganizationsV1DatabaseRepository,
  ) {}

  async execute(): Promise<void> {
    const log: ILogMetadata = {
      steps: [],
      scope: { moduleName: ExtractEntitiesFromExternalSourceUseCase.name, methodName: 'listAll' },
    };
    try {
      log.steps.push({ message: 'Listing agents from external multi institutions...' });
      const multiInstitutionsV1DtoList = await this.multiInstitutionsV1DatabaseRepository.listAll();
      const agentsV1FromMultiInstitutionsV1DtoList = multiInstitutionsV1DtoList.map(
        ConvertMultiInstitutionV1InAgentV1Service.execute,
      );
      const organizationsV1FromMultiInstitutionsV1Dto = multiInstitutionsV1DtoList.map(
        (multiInstitutionV1Dto, index) => {
          return ConvertMultiInstitutionV1InOrganizationV1Service.execute({
            // Institutions do not have owners (root) until we know what agent should be the temporary holder of the account
            ownerAgentId: null,
            multiInstitutionV1Dto,
            agentV1Dto: agentsV1FromMultiInstitutionsV1DtoList[index],
          });
        },
      );

      log.steps.push({ message: 'Listing agents from external multi centrals...' });
      const multiCentralsV1 = await this.multiCentralsV1DatabaseRepository.listAll();
      const agentsV1FromMultiCentralsV1 = multiCentralsV1.map(ConvertMultiCentralV1InAgentV1Service.execute);
      const organizationsV1FromMultiCentralsV1 = multiCentralsV1.map((multiCentralV1Dto, index) => {
        ConvertMultiCentralV1InOrganizationV1Service.execute({
          agentV1Dto: agentsV1FromMultiCentralsV1[index],
          multiCentralV1Dto,
        });
      });

      log.steps.push({ message: 'Listing agents from external multi units...' });
      const multiUnitsV1 = ExtractMultiUnitsV1FromMultiCentralsV1Service.execute(multiCentralsV1);
      const agentsV1FromMultiUnitsV1 = multiUnitsV1.map(ConvertMultiUnitV1InAgentV1Service.execute);

      log.steps.push({ message: 'Listing agents from external multi departments...' });
      const multiDepartmentsV1 = ExtractMultiDepartmentsV1FromMultiCentralsV1Service.execute(multiCentralsV1);
      const agentsV1FromMultiDepartmentsV1 = multiDepartmentsV1.map(ConvertMultiDepartmentV1InAgentV1Service.execute);

      log.steps.push({ message: 'Combining agents from external source...' });
      const agentsV1DtoList = [
        ...agentsV1FromMultiInstitutionsV1DtoList,
        ...agentsV1FromMultiUnitsV1,
        ...agentsV1FromMultiCentralsV1,
        ...agentsV1FromMultiDepartmentsV1,
      ];

      log.steps.push({ message: 'Verifying agent id uniqueness...' });
      const uniqueIds = new Set(agentsV1DtoList.map((item) => item.id));
      if (uniqueIds.size !== agentsV1DtoList.length) {
        console.log(agentsV1DtoList.find((item) => item.id === 'e7d601521ea3486732718764ef84'));
        throw new Error('Duplicate IDs found in agents data');
      }

      const uniqueNicknames = new Set(agentsV1DtoList.map((item) => item.nickname));
      if (uniqueNicknames.size !== agentsV1DtoList.length) {
        throw new Error('Duplicate nicknames found in agents data');
      }

      const agentsByEmail = agentsV1DtoList.reduce((acc, item) => {
        acc[item.email] = acc[item.email] + 1 || 1;
        return acc;
      }, {});

      log.steps.push({
        message: 'Creating agents from external source...',
        metadata: { count: agentsV1DtoList.length, agentsByEmail: agentsByEmail },
      });

      await this.agentsV1DatabaseRepository.createMany(agentsV1DtoList);
    } catch (error) {
      log.steps.push({ message: 'Error seeding database from external source.', metadata: { error: error.stack } });
      nativeLogger.error(`Error seeding database from external source: ${error.message}`, log);
    }
  }
}
