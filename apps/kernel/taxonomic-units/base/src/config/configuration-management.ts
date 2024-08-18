import { MongoDbDriver } from '@peerlab/kernel/shared-ts-utils/drivers/mongodb-driver';
import { winstonLogger } from '@peerlab/kernel/shared-ts-utils/logs/winston-logger';
import { ExtractEntitiesFromExternalSourceUseCase } from '../domains/_shared/core/use-cases/extract-entities-from-external-source';
import { MongoDbAgentsV1DatabaseRepository } from '../domains/agents-v1/adapters/database-repository-mongodb';
import { AgentsV1DatabaseRepository } from '../domains/agents-v1/core/database-repository';
import { fakeAgents } from '../domains/agents-v1/core/fixtures';
import { FileSystemMultiCentralsV1Repository } from '../domains/multi-central-v1/adapters/database-repository-multi-file-system';
import { RestApiMultiCentralsV1DatabaseRepository } from '../domains/multi-central-v1/adapters/database-repository-multi-rest-api';
import { MultiCentralsV1DatabaseRepository } from '../domains/multi-central-v1/core/database-repository';
import { FileSystemMultiInstitutionsV1Repository } from '../domains/multi-institution-v1/adapters/database-repository-multi-file-system';
import { RestApiMultiInstitutionsV1DatabaseRepository } from '../domains/multi-institution-v1/adapters/database-repository-rest-api';
import { MultiInstitutionsV1DatabaseRepository } from '../domains/multi-institution-v1/core/database-repository';
import { MongoDbOrganizationsV1Repository } from '../domains/taxonomic-unit-v1/adapters/database-repository-mongodb';
import { OrganizationsV1DatabaseRepository } from '../domains/taxonomic-unit-v1/core/database-repository';
import { fakeOrganizations } from '../domains/taxonomic-unit-v1/core/fixtures';
import { CreateOrganizationV1UseCase } from '../domains/taxonomic-unit-v1/core/use-cases/create-organization';
import { FilterOrganizationsV1UseCase } from '../domains/taxonomic-unit-v1/core/use-cases/filter-organizations';
import { GetOrganizationV1ByIdUseCase } from '../domains/taxonomic-unit-v1/core/use-cases/get-organization-by-id';
import { defaultConfiguration } from './default-configuration';

export type IAppConfiguration = typeof defaultConfiguration;

export class ConfigurationManager {
  defaultConfiguration = defaultConfiguration;
  config: IAppConfiguration;
  isProduction: boolean;
  databaseDriver: MongoDbDriver;
  repositories?: {
    organizationsV1: OrganizationsV1DatabaseRepository;
    agentsV1: AgentsV1DatabaseRepository;
    multiInstitutionsV1: MultiInstitutionsV1DatabaseRepository;
    multiCentralsV1: MultiCentralsV1DatabaseRepository;
  };
  useCases?: {
    extractEntitiesFromExternalSource: ExtractEntitiesFromExternalSourceUseCase;
    createOrganizationV1UseCase: CreateOrganizationV1UseCase;
    filterOrganizationsV1: FilterOrganizationsV1UseCase;
    getOrganizationV1ById: GetOrganizationV1ByIdUseCase;
  };

  constructor(configOverride: IAppConfiguration = defaultConfiguration) {
    this.config = configOverride;
    this.isProduction = this.config.server.nodeEnv === 'production';
  }

  async initialize() {
    if (['mongodb-in-memory', 'mongodb'].includes(this.config.database.provider)) {
      winstonLogger.info('Connecting to MongoDb...');
      const mongoDbDriver = new MongoDbDriver(this.getConfig().database.uri);
      this.databaseDriver = mongoDbDriver;
      await this.databaseDriver.connectToDatabase(this.getConfig().database.name);
      winstonLogger.info('Connected to MongoDb', {
        scope: { moduleName: '', methodName: '' },
        steps: [{ message: '', metadata: { databaseName: this.getConfig().database.name } }],
      });
    }

    await this.initializeRepositories();

    if (this.config.database.seed === 'true') {
      return await this.seedDatabase();
    }
  }

  getConfig() {
    return this.config;
  }

  setConfig(configOverride: IAppConfiguration) {
    this.config = configOverride;
  }

  getDefaultConfig() {
    return this.defaultConfiguration;
  }

  getDatabaseDriver() {
    return this.databaseDriver;
  }

  async initializeRepositories(): Promise<void> {
    if (this.repositories) {
      return;
    }

    const multiInstitutionsV1BaseUrl = this.config.externalServices.multiInstitutionsV1BaseUrl;
    const multiCentralsV1BaseUrl = this.config.externalServices.multiCentralsV1BaseUrl;

    if (this.config.server.nodeEnv === 'production') {
      winstonLogger.info('Production mode');
      this.repositories = {
        organizationsV1: new MongoDbOrganizationsV1Repository(this.getDatabaseDriver()),
        agentsV1: new MongoDbAgentsV1DatabaseRepository(this.getDatabaseDriver()),
        multiInstitutionsV1: new RestApiMultiInstitutionsV1DatabaseRepository(multiInstitutionsV1BaseUrl),
        multiCentralsV1: new RestApiMultiCentralsV1DatabaseRepository(multiCentralsV1BaseUrl),
      };

      await this.repositories.agentsV1.generateIndexes();
      await this.repositories.organizationsV1.generateIndexes();
    }

    if (this.config.server.nodeEnv === 'development') {
      winstonLogger.info('Development mode');
      this.repositories = {
        organizationsV1: new MongoDbOrganizationsV1Repository(this.getDatabaseDriver()),
        agentsV1: new MongoDbAgentsV1DatabaseRepository(this.getDatabaseDriver()),
        multiInstitutionsV1: new FileSystemMultiInstitutionsV1Repository(),
        multiCentralsV1: new FileSystemMultiCentralsV1Repository(),
      };
      await this.repositories.agentsV1.generateIndexes();
    }

    if (this.config.server.nodeEnv === 'test') {
      winstonLogger.info('Test mode');
      this.repositories = {
        organizationsV1: new MongoDbOrganizationsV1Repository(this.getDatabaseDriver()),
        agentsV1: new MongoDbAgentsV1DatabaseRepository(this.getDatabaseDriver()),
        multiInstitutionsV1: new FileSystemMultiInstitutionsV1Repository(),
        multiCentralsV1: new FileSystemMultiCentralsV1Repository(),
      };
      await this.repositories.agentsV1.generateIndexes();
    }

    this.useCases = {
      extractEntitiesFromExternalSource: new ExtractEntitiesFromExternalSourceUseCase(
        this.repositories.multiInstitutionsV1,
        this.repositories.multiCentralsV1,
        this.repositories.agentsV1,
        this.repositories.organizationsV1,
      ),
      createOrganizationV1UseCase: new CreateOrganizationV1UseCase(
        this.repositories.organizationsV1,
        this.repositories.agentsV1,
      ),
      getOrganizationV1ById: new GetOrganizationV1ByIdUseCase(this.repositories.organizationsV1),
      filterOrganizationsV1: new FilterOrganizationsV1UseCase(
        this.repositories.organizationsV1,
        this.repositories.agentsV1,
      ),
    };
  }

  async getRepositories() {
    return this.repositories;
  }

  async getUseCases() {
    return this.useCases;
  }

  async seedDatabase() {
    if (this.config.server.nodeEnv !== 'production') {
      winstonLogger.info('Seeding database with fake agents...');
      const { count: agentsCount } = await this.repositories.agentsV1.createMany(fakeAgents);
      winstonLogger.info(`Total fake agents created: ${agentsCount}`);
      const { count: organizationsCount } = await this.repositories.organizationsV1.createMany(fakeOrganizations);
      winstonLogger.info(`Total fake organizations created: ${organizationsCount}`);
    }
  }
}

export const configurationManager = new ConfigurationManager();
