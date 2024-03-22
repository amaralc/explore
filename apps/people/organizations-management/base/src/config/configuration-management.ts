import { MongoDbDriver } from '../database-drivers/mongodb-driver';
import { MongoDbAgentsV1DatabaseRepository } from '../domains/agents-v1/adapters/database-repository-mongodb';
import { AgentsV1DatabaseRepository } from '../domains/agents-v1/core/database-repository';
import { fakeAgents } from '../domains/agents-v1/core/fixtures';
import { MongoDbOrganizationsV1Repository } from '../domains/organizations-v1/adapters/repository-mongodb';
import { OrganizationsV1Repository } from '../domains/organizations-v1/core/repository';
import { defaultConfiguration } from './default-configuration';

export type IAppConfiguration = typeof defaultConfiguration;

export class ConfigurationManager {
  defaultConfiguration = defaultConfiguration;
  config: IAppConfiguration;
  isProduction: boolean;
  databaseDriver: MongoDbDriver;
  repositories?: {
    organizationsV1: OrganizationsV1Repository;
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
    if (this.config.database.seed === 'true') {
      await this.seedDatabase();
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
    }

    if (this.config.server.nodeEnv === 'development') {
      console.log('Development mode');
      this.repositories = {
        organizationsV1: new MongoDbOrganizationsV1Repository(this.getDatabaseDriver()),
        agentsV1: new MongoDbAgentsV1DatabaseRepository(this.getDatabaseDriver()),
      };
    }

    if (this.config.server.nodeEnv === 'test') {
      console.log('Test mode');
      this.repositories = {
        organizationsV1: new MongoDbOrganizationsV1Repository(this.getDatabaseDriver()),
        agentsV1: new MongoDbAgentsV1DatabaseRepository(this.getDatabaseDriver()),
      };
    }
  }

  async getRepositories() {
    if (!this.repositories) {
      await this.initializeRepositories();
    }

    return this.repositories;
  }

  async seedDatabase() {
    if (this.config.database.seed === 'true') {
      console.log('Seeding database...');
      const { count } = await this.repositories.agentsV1.createMany(fakeAgents);
      console.log(`Total agents created: ${count}`);
    }
  }
}

export const configurationManager = new ConfigurationManager();
