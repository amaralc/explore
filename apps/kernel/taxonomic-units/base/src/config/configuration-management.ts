import { MongoDbDriver } from '@peerlab/kernel/shared-ts-utils/drivers/mongodb-driver';
import { winstonLogger } from '@peerlab/kernel/shared-ts-utils/logs/winston-logger';
import { MongoDbTaxonomicUnitInstancesV1DatabaseRepository } from '../domains/taxonomic-unit-instance-v1/adapters/database-repository-mongodb';
import { TaxonomicUnitInstancesV1DatabaseRepository } from '../domains/taxonomic-unit-instance-v1/core/database-repository';
import { CreateTaxonomicUnitV1InstanceUseCase } from '../domains/taxonomic-unit-instance-v1/core/use-cases/create-instance';
import { MongoDbTaxonomicUnitsV1DatabaseRepository } from '../domains/taxonomic-unit-v1/adapters/database-repository-mongodb';
import { TaxonomicUnitsV1DatabaseRepository } from '../domains/taxonomic-unit-v1/core/database-repository';
import { fakeTaxonomicUnitsV1 } from '../domains/taxonomic-unit-v1/core/fixtures';
import { CreateFirstVersionOfTaxonomicUnitV1UseCase } from '../domains/taxonomic-unit-v1/core/use-cases/create-first-version';
import { FilterTaxonomicUnitsV1UseCase } from '../domains/taxonomic-unit-v1/core/use-cases/filter';
import { GetTaxonomicUnitV1ByIdUseCase } from '../domains/taxonomic-unit-v1/core/use-cases/get-by-id';
import { defaultConfiguration } from './default-configuration';

export type IAppConfiguration = typeof defaultConfiguration;

export class ConfigurationManager {
  defaultConfiguration = defaultConfiguration;
  config: IAppConfiguration;
  isProduction: boolean;
  databaseDriver: MongoDbDriver;
  repositories?: {
    taxonomicUnitsV1: TaxonomicUnitsV1DatabaseRepository;
    taxonomicUnitInstancesV1: TaxonomicUnitInstancesV1DatabaseRepository;
  };
  useCases?: {
    createFirstVersionOfTaxonomicUnitV1UseCase: CreateFirstVersionOfTaxonomicUnitV1UseCase;
    filterOrganizationsV1: FilterTaxonomicUnitsV1UseCase;
    getTaxonomicUnitV1ById: GetTaxonomicUnitV1ByIdUseCase;
    createTaxonomicUnitV1Instance: CreateTaxonomicUnitV1InstanceUseCase;
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

    if (this.config.server.nodeEnv === 'production') {
      winstonLogger.info('Production mode');
      this.repositories = {
        taxonomicUnitsV1: new MongoDbTaxonomicUnitsV1DatabaseRepository(this.getDatabaseDriver()),
        taxonomicUnitInstancesV1: new MongoDbTaxonomicUnitInstancesV1DatabaseRepository(this.getDatabaseDriver()),
      };

      await this.repositories.taxonomicUnitsV1.generateIndexes();
    }

    if (this.config.server.nodeEnv === 'development') {
      winstonLogger.info('Development mode');
      this.repositories = {
        taxonomicUnitsV1: new MongoDbTaxonomicUnitsV1DatabaseRepository(this.getDatabaseDriver()),
        taxonomicUnitInstancesV1: new MongoDbTaxonomicUnitInstancesV1DatabaseRepository(this.getDatabaseDriver()),
      };
      await this.repositories.taxonomicUnitsV1.generateIndexes();
    }

    if (this.config.server.nodeEnv === 'test') {
      winstonLogger.info('Test mode');
      this.repositories = {
        taxonomicUnitsV1: new MongoDbTaxonomicUnitsV1DatabaseRepository(this.getDatabaseDriver()),
        taxonomicUnitInstancesV1: new MongoDbTaxonomicUnitInstancesV1DatabaseRepository(this.getDatabaseDriver()),
      };
      await this.repositories.taxonomicUnitsV1.generateIndexes();
    }

    this.useCases = {
      createFirstVersionOfTaxonomicUnitV1UseCase: new CreateFirstVersionOfTaxonomicUnitV1UseCase(
        this.repositories.taxonomicUnitsV1,
      ),
      getTaxonomicUnitV1ById: new GetTaxonomicUnitV1ByIdUseCase(this.repositories.taxonomicUnitsV1),
      filterOrganizationsV1: new FilterTaxonomicUnitsV1UseCase(this.repositories.taxonomicUnitsV1),
      createTaxonomicUnitV1Instance: new CreateTaxonomicUnitV1InstanceUseCase(
        this.repositories.taxonomicUnitsV1,
        this.repositories.taxonomicUnitInstancesV1,
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
      winstonLogger.info('Seeding database with fake taxonomic units...');
      const { count: taxonomicUnitsV1Count } =
        await this.repositories.taxonomicUnitsV1.createMany(fakeTaxonomicUnitsV1);
      winstonLogger.info(`Total fake taxonomic units created: ${taxonomicUnitsV1Count}`);
    }
  }
}

export const configurationManager = new ConfigurationManager();
