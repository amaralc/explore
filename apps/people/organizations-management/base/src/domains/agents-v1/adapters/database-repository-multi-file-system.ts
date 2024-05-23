import { readJsonFile } from '@peerlab/kernel/shared-ts-utils/files/read-json-file';
import { ILogMetadata } from '@peerlab/kernel/shared-ts-utils/logs/application-logger';
import { nativeLogger } from '@peerlab/kernel/shared-ts-utils/logs/native-logger';
import { randomBytes } from 'crypto';
import { CreateManyResponseDto } from '../../_shared/types';
import { IMultiCentralV1Dto } from '../../multi-central-v1/core/entity';
import { ConvertMultiCentralV1InAgentV1Service } from '../../multi-central-v1/core/services/convert-multi-central-v1-in-agent-v1';
import { IMultiDepartmentV1Dto } from '../../multi-department-v1/core/entity';
import { ConvertMultiDepartmentV1InAgentV1Service } from '../../multi-department-v1/core/services/convert-multi-department-v1-in-agent-v1';
import { IMultiInstitutionV1Dto, MultiInstitutionV1Entity } from '../../multi-institution-v1/core/entity';
import { ConvertMultiInstitutionV1InAgentV1Service } from '../../multi-institution-v1/core/services/convert-multi-institution-v1-in-agent-v1';
import { IMultiUnitV1Dto } from '../../multi-unit-v1/core/entity';
import { ConvertMultiUnitV1InAgentV1Service } from '../../multi-unit-v1/core/services/convert-multi-unit-v1-in-agent-v1';
import { AgentsV1DatabaseRepository } from '../core/database-repository';
import { AgentV1Entity, IAgentV1Dto } from '../core/entity';

export class MultiFileSystemAgentsV1Repository implements AgentsV1DatabaseRepository {
  constructor(
    private readonly multiInstitutionsV1FilePath: string,
    private readonly multiCentralsV1FilePath: string,
  ) {}

  private async getAllMultiInstitutionsV1(): Promise<Array<IMultiInstitutionV1Dto>> {
    const responseData = readJsonFile(this.multiInstitutionsV1FilePath) as Array<IMultiInstitutionV1Dto>;

    const multiInstitutionsV1DtoList = responseData.map((item) => {
      const entity = new MultiInstitutionV1Entity(item);
      return entity.getDto();
    });

    const uniqueIds = new Set(multiInstitutionsV1DtoList.map((item) => item.id));
    if (uniqueIds.size !== multiInstitutionsV1DtoList.length) {
      throw new Error('Duplicate IDs found in institutions data');
    }

    return multiInstitutionsV1DtoList;
  }

  private async getAllMultiCentralsV1(): Promise<Array<IMultiCentralV1Dto>> {
    const multiInstitutionsV1Response = readJsonFile(this.multiCentralsV1FilePath) as {
      count: number;
      rows: Array<IMultiCentralV1Dto>;
    };

    const multiInstitutionsV1 = multiInstitutionsV1Response.rows;

    const uniqueIds = new Set(multiInstitutionsV1.map((item) => item.id));
    if (uniqueIds.size !== multiInstitutionsV1.length) {
      throw new Error('Duplicate IDs found in centrals data');
    }

    return multiInstitutionsV1;
  }

  private getMultiUnitsV1FromMultiCentralsV1(
    multiCentralsV1DtoList: Array<IMultiCentralV1Dto>,
  ): Array<IMultiUnitV1Dto> {
    const allMultiUnitsV1 = multiCentralsV1DtoList.map((item) => item.unidade);
    const nonNullMultiUnitsV1 = allMultiUnitsV1.filter(Boolean);
    const stringifiedUnitsV1 = nonNullMultiUnitsV1.map((item) => JSON.stringify(item));
    const uniqueMultiUnitsV1 = [...new Set(stringifiedUnitsV1).values()].map((item) => JSON.parse(item));
    return uniqueMultiUnitsV1;
  }

  private getMultiDepartmentsFromMultiCentralsV1(
    multiCentralsV1DtoList: Array<IMultiCentralV1Dto>,
  ): Array<IMultiDepartmentV1Dto> {
    const allMultiDepartmentsV1 = multiCentralsV1DtoList.map((item) => item.departamento);
    const nonNullMultiDepartmentsV1 = allMultiDepartmentsV1.filter(Boolean);
    const stringifiedDepartmentsV1 = nonNullMultiDepartmentsV1.map((item) => JSON.stringify(item));
    const uniqueMultiDepartmentsV1 = [...new Set(stringifiedDepartmentsV1).values()].map((item) => JSON.parse(item));
    return uniqueMultiDepartmentsV1;
  }

  public async listAll(): Promise<Array<IAgentV1Dto>> {
    const log: ILogMetadata = {
      steps: [],
      scope: {
        moduleName: MultiFileSystemAgentsV1Repository.name,
        methodName: 'listAll',
      },
    };

    try {
      log.steps.push({ message: 'Listing agents from external multi institutions...' });
      const multiInstitutionsV1DtoList = await this.getAllMultiInstitutionsV1();
      const agentsV1FromMultiInstitutionsV1DtoList = multiInstitutionsV1DtoList.map(
        ConvertMultiInstitutionV1InAgentV1Service.execute,
      );

      log.steps.push({ message: 'Listing agents from external multi centrals...' });
      const multiCentralsV1 = await this.getAllMultiCentralsV1();
      const agentsV1FromMultiCentralsV1 = multiCentralsV1.map(ConvertMultiCentralV1InAgentV1Service.execute);

      log.steps.push({ message: 'Listing agents from external multi units...' });
      const multiUnitsV1 = this.getMultiUnitsV1FromMultiCentralsV1(multiCentralsV1);
      const agentsV1FromMultiUnitsV1 = multiUnitsV1.map(ConvertMultiUnitV1InAgentV1Service.execute);

      log.steps.push({ message: 'Listing agents from external multi departments...' });
      const multiDepartmentsV1 = this.getMultiDepartmentsFromMultiCentralsV1(multiCentralsV1);
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
        message: 'Listing agents from external source...',
        metadata: {
          count: agentsV1DtoList.length,
          agentsByEmail: agentsByEmail,
        },
      });

      nativeLogger.info('Success listing agents from external source', log);
      console.log(agentsByEmail);
      return agentsV1DtoList;
    } catch (error) {
      log.steps.push({ message: 'Error seeding database from external source.', metadata: { error: error.stack } });
      nativeLogger.error(`Error seeding database from external source: ${error.message}`, log);
    }
  }

  public generateUniqueId(): string {
    return randomBytes(14).toString('hex'); // 28 characters (Firebase uid length)
  }

  public async generateIndexes(): Promise<void> {
    throw new Error('Method not implemented');
  }

  public async create(inputDto: AgentV1Entity): Promise<AgentV1Entity> {
    throw new Error('Method not implemented');
  }

  public async createMany(agents: AgentV1Entity[]): Promise<CreateManyResponseDto> {
    throw new Error('Method not implemented');
  }

  public async getAgentById(id: string): Promise<AgentV1Entity | null> {
    throw new Error('Method not implemented');
  }

  async findByEmail(email: string): Promise<Array<AgentV1Entity>> {
    throw new Error('Method not implemented');
  }

  async getAgentByNickname(nickname: string): Promise<IAgentV1Dto | null> {
    throw new Error('Method not implemented');
  }

  async getByEmailAndType(email: string, type: IAgentV1Dto['type']): Promise<AgentV1Entity | null> {
    throw new Error('Method not implemented');
  }

  public async deleteById(id: string): Promise<void> {
    throw new Error('Method not implemented');
  }
}
