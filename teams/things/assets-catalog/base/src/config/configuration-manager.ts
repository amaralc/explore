import { MongoDbDriver } from '@peerlab/kernel/shared-ts-utils/drivers/mongodb-driver';
import { winstonLogger } from '@peerlab/kernel/shared-ts-utils/logs/winston-logger';
import { MongoDbAssetsV1DatabaseRepository } from '../domains/assets-v1/adapters/database-repository-mongodb';
import { fakeAssetsV1 } from '../domains/assets-v1/core/fixtures';
import { AssetsV1DatabaseRepository } from '../domains/assets-v1/core/repository-database';
import { MongoDbTaxonomicUnitsV1DatabaseRepository } from '../domains/taxonomic-units-v1/adapters/database-repository-mongodb';
import { fakeTaxonomicUnitsV1 } from '../domains/taxonomic-units-v1/core/fixtures';
import { TaxonomicUnitsV1DatabaseRepository } from '../domains/taxonomic-units-v1/core/repository-database';
import { IAppConfiguration } from './default-configuration';

export class ConfigurationManager {
  config: IAppConfiguration;
  isProduction: boolean;
  databaseDriver: MongoDbDriver;
  repositories?: {
    taxonomicUnitsV1Database: TaxonomicUnitsV1DatabaseRepository;
    assetsV1Database?: AssetsV1DatabaseRepository;
  };

  constructor(private readonly initialConfiguration: IAppConfiguration) {
    this.config = this.initialConfiguration;
    this.isProduction = this.config.server.nodeEnv === 'production';
  }

  async initialize() {
    if (['mongodb-in-memory', 'mongodb'].includes(this.config.database.provider)) {
      winstonLogger.info('Connecting to MongoDb...');
      const mongoDbDriver = new MongoDbDriver(this.getConfig().database.uri);
      this.databaseDriver = mongoDbDriver;
      await this.databaseDriver.connectToDatabase(this.getConfig().database.name);
      winstonLogger.info('Connected to MongoDb');
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
    return this.initialConfiguration;
  }

  getDatabaseDriver() {
    return this.databaseDriver;
  }

  async initializeRepositories(): Promise<void> {
    if (this.repositories) {
      return;
    }

    if (this.config.server.nodeEnv === 'production') {
      winstonLogger.info('Running in production mode...');
      this.repositories = {
        taxonomicUnitsV1Database: new MongoDbTaxonomicUnitsV1DatabaseRepository(this.databaseDriver),
        assetsV1Database: new MongoDbAssetsV1DatabaseRepository(this.databaseDriver),
      };

      await this.repositories.taxonomicUnitsV1Database.generateIndexes();
    }

    if (this.config.server.nodeEnv === 'development') {
      winstonLogger.info('Running in development mode...');
      this.repositories = {
        taxonomicUnitsV1Database: new MongoDbTaxonomicUnitsV1DatabaseRepository(this.databaseDriver),
        assetsV1Database: new MongoDbAssetsV1DatabaseRepository(this.databaseDriver),
      };

      await this.repositories.taxonomicUnitsV1Database.generateIndexes();
    }

    if (this.config.server.nodeEnv === 'test') {
      winstonLogger.info('Running in test mode...');
      this.repositories = {
        taxonomicUnitsV1Database: new MongoDbTaxonomicUnitsV1DatabaseRepository(this.databaseDriver),
        assetsV1Database: new MongoDbAssetsV1DatabaseRepository(this.databaseDriver),
      };
      await this.repositories.taxonomicUnitsV1Database.generateIndexes();
    }
  }

  getRepositories() {
    winstonLogger.info('Getting repositories...');
    return this.repositories;
  }

  async seedDatabase() {
    if (this.config.database.seed === 'true' && this.config.server.nodeEnv !== 'production') {
      winstonLogger.info('Database seed enabled. Seeding database...');
      const { count: taxonomicUnitsCount } =
        await this.repositories.taxonomicUnitsV1Database.createMany(fakeTaxonomicUnitsV1);
      winstonLogger.info(`Total taxonomic units created: ${taxonomicUnitsCount}`);

      const { count: assetsCount } = await this.repositories.assetsV1Database.createMany(fakeAssetsV1);
      winstonLogger.info(`Total assets created: ${assetsCount}`);
    }
  }
}
