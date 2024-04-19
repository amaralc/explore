import { MongoDbDriver } from '@peerlab/kernel/shared-ts-utils/drivers/mongodb-driver';
import { ApplicationLogger } from '@peerlab/kernel/shared-ts-utils/logs/application-logger';
import { MongoDbTaxonomicUnitsV1DatabaseRepository } from '../domains/taxonomic-units-v1/adapters/database-repository-mongodb';
import { fakeTaxonomicUnitsV1 } from '../domains/taxonomic-units-v1/core/fixtures';
import { TaxonomicUnitsV1DatabaseRepository } from '../domains/taxonomic-units-v1/core/repository-database';
import { defaultConfiguration } from './default-configuration';
export type IAppConfiguration = typeof defaultConfiguration;

export class ConfigurationManager {
  defaultConfiguration = defaultConfiguration;
  config: IAppConfiguration;
  isProduction: boolean;
  databaseDriver: MongoDbDriver;
  repositories?: {
    taxonomicUnitsV1Database: TaxonomicUnitsV1DatabaseRepository;
  };

  constructor(
    configOverride: IAppConfiguration = defaultConfiguration,
    private logger: ApplicationLogger,
  ) {
    this.config = configOverride;
    this.isProduction = this.config.server.nodeEnv === 'production';
    this.logger = logger;
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
    if (this.config.database.seed === 'true' && this.config.server.nodeEnv !== 'production') {
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

  getLogger() {
    return this.logger;
  }

  async initializeRepositories(): Promise<void> {
    if (this.repositories) {
      return;
    }

    if (this.config.server.nodeEnv === 'production') {
      console.log('Production mode');
      this.repositories = {
        taxonomicUnitsV1Database: new MongoDbTaxonomicUnitsV1DatabaseRepository(this.getDatabaseDriver()),
      };

      await this.repositories.taxonomicUnitsV1Database.generateIndexes();
    }

    if (this.config.server.nodeEnv === 'development') {
      console.log('Development mode');
      this.repositories = {
        taxonomicUnitsV1Database: new MongoDbTaxonomicUnitsV1DatabaseRepository(this.getDatabaseDriver()),
      };
      await this.repositories.taxonomicUnitsV1Database.generateIndexes();
    }

    if (this.config.server.nodeEnv === 'test') {
      console.log('Test mode');
      this.repositories = {
        taxonomicUnitsV1Database: new MongoDbTaxonomicUnitsV1DatabaseRepository(this.getDatabaseDriver()),
      };
      await this.repositories.taxonomicUnitsV1Database.generateIndexes();
    }
  }

  async getRepositories() {
    if (!this.repositories) {
      await this.initializeRepositories();
    }

    return this.repositories;
  }

  async seedDatabase() {
    if (this.config.database.seed === 'true' && this.config.server.nodeEnv !== 'production') {
      console.log('Seeding database...');
      const { count } = await this.repositories.taxonomicUnitsV1Database.createMany(fakeTaxonomicUnitsV1);
      console.log(`Total agents created: ${count}`);
    }
  }
}
