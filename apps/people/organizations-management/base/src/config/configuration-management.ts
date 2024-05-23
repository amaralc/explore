import { MongoDbDriver } from '@peerlab/kernel/shared-ts-utils/drivers/mongodb-driver';
import { ILogMetadata } from '@peerlab/kernel/shared-ts-utils/logs/application-logger';
import { nativeLogger } from '@peerlab/kernel/shared-ts-utils/logs/native-logger';
import { MongoDbAgentsV1DatabaseRepository } from '../domains/agents-v1/adapters/database-repository-mongodb';
import { MultiFileSystemAgentsV1Repository } from '../domains/agents-v1/adapters/database-repository-multi-file-system';
import { MultiRestApiAgentsV1DatabaseRepository } from '../domains/agents-v1/adapters/database-repository-multi-rest-api';
import { AgentsV1DatabaseRepository } from '../domains/agents-v1/core/database-repository';
import { fakeAgents } from '../domains/agents-v1/core/fixtures';
import { MongoDbOrganizationsV1Repository } from '../domains/organizations-v1/adapters/repository-mongodb';
import { OrganizationsV1DatabaseRepository } from '../domains/organizations-v1/core/database-repository';
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
  };

  constructor(configOverride: IAppConfiguration = defaultConfiguration) {
    this.config = configOverride;
    this.isProduction = this.config.server.nodeEnv === 'production';
  }

  async initialize() {
    if (['mongodb-in-memory', 'mongodb'].includes(this.config.database.provider)) {
      console.log('Connecting to MongoDb...');
      const mongoDbDriver = new MongoDbDriver(this.getConfig().database.uri);
      this.databaseDriver = mongoDbDriver;
      await this.databaseDriver.connectToDatabase(this.getConfig().database.name);
      console.log('Connected to MongoDb');
    }

    await this.initializeRepositories();

    if (this.config.database.seedFromExternalSource === 'true') {
      return await this.seedDatabaseFromExternalSource();
    }

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

    if (this.config.server.nodeEnv === 'production') {
      console.log('Production mode');
      this.repositories = {
        organizationsV1: new MongoDbOrganizationsV1Repository(this.getDatabaseDriver()),
        agentsV1: new MongoDbAgentsV1DatabaseRepository(this.getDatabaseDriver()),
      };

      await this.repositories.agentsV1.generateIndexes();
    }

    if (this.config.server.nodeEnv === 'development') {
      console.log('Development mode');
      this.repositories = {
        organizationsV1: new MongoDbOrganizationsV1Repository(this.getDatabaseDriver()),
        agentsV1: new MongoDbAgentsV1DatabaseRepository(this.getDatabaseDriver()),
      };
      await this.repositories.agentsV1.generateIndexes();
    }

    if (this.config.server.nodeEnv === 'test') {
      console.log('Test mode');
      this.repositories = {
        organizationsV1: new MongoDbOrganizationsV1Repository(this.getDatabaseDriver()),
        agentsV1: new MongoDbAgentsV1DatabaseRepository(this.getDatabaseDriver()),
      };
      await this.repositories.agentsV1.generateIndexes();
    }
  }

  async getRepositories() {
    return this.repositories;
  }

  async seedDatabase() {
    if (this.config.server.nodeEnv !== 'production') {
      console.log('Seeding database...');
      const { count } = await this.repositories.agentsV1.createMany(fakeAgents);
      console.log(`Total agents created: ${count}`);
    }
  }

  async seedDatabaseFromExternalSource() {
    const log: ILogMetadata = {
      scope: { moduleName: ConfigurationManager.name, methodName: 'seedDatabaseFromExternalSource' },
      steps: [{ message: 'Seeding database from external source...' }],
    };

    try {
      log.steps.push({ message: 'Initializing external source agents repository...' });

      let externalSourceAgentsV1DatabaseRepository: AgentsV1DatabaseRepository;

      const source: 'rest-api' | 'file-system' = process.env['EXTERNAL_SOURCE'] as
        | 'rest-api'
        | 'file-system'
        | undefined;

      if (source === 'file-system') {
        log.steps.push({ message: 'Reading external agents from file system...' });
        const multiInstitutionsV1FilePath =
          'apps/people/organizations-management/base/src/domains/multi-institution-v1/core/fixtures-content-usp-institutions.json';
        const multiCentralsV1FilePath =
          'apps/people/organizations-management/base/src/domains/multi-central-v1/core/fixtures-content-usp-centrals.json';
        externalSourceAgentsV1DatabaseRepository = new MultiFileSystemAgentsV1Repository(
          multiInstitutionsV1FilePath,
          multiCentralsV1FilePath,
        );
      } else {
        log.steps.push({ message: 'Reading external agents from multi rest api...' });
        const multiInstitutionsV1BaseUrl = this.config.externalServices.multiInstitutionsV1BaseUrl;
        const multiCentralsV1BaseUrl = this.config.externalServices.multiCentralsV1BaseUrl;
        externalSourceAgentsV1DatabaseRepository = new MultiRestApiAgentsV1DatabaseRepository(
          multiInstitutionsV1BaseUrl,
          multiCentralsV1BaseUrl,
        );
      }

      log.steps.push({ message: 'Listing agents from external source...' });
      const agentsV1 = await externalSourceAgentsV1DatabaseRepository.listAll();

      log.steps.push({ message: 'Storing external source agents in service datastore...' });
      const { count } = await this.repositories.agentsV1.createMany(agentsV1);

      nativeLogger.info(`Seeding database from external source completed. Total agents created: ${count}`, log);
    } catch (error) {
      log.steps.push({ message: 'Error seeding database from external source.', metadata: { error: error.stack } });
      nativeLogger.error(`Error seeding database from external source: ${error.message}`, log);
    }
  }
}

export const configurationManager = new ConfigurationManager();
