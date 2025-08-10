import { Collection, Db, MongoClient } from 'mongodb';
import { ILogMetadata } from '../logs/application-logger';
import { winstonLogger } from '../logs/winston-logger';

export class MongoDbDriver {
  client: MongoClient;
  database?: Db;

  constructor(uri: string) {
    try {
      this.client = new MongoClient(uri);
    } catch (error) {
      throw new Error('Error creating client');
    }
  }

  async connectToDatabase(databaseName: string) {
    if (!this.client) throw new Error('No client');
    await this.client.connect();
    winstonLogger.info('Connected to database', {
      scope: {
        moduleName: MongoDbDriver.name,
        methodName: 'connectToDatabase',
      },
      steps: [],
    });
    this.database = this.client.db(databaseName);
  }

  async dropDatabase(databaseName: string) {
    const log: ILogMetadata = {
      scope: {
        moduleName: MongoDbDriver.name,
        methodName: 'dropDatabase',
      },
      steps: [],
    };
    try {
      if (process.env['NODE_ENV'] === 'production') {
        // WARNING
        winstonLogger.warn('Attempt to drop database in production node environment', log);
        return;
      }

      if (!this.database) {
        throw new Error('Database not found');
      }

      if (this.database.databaseName !== databaseName) {
        throw new Error('Database name does not match with existing database');
      }

      await this.database.dropDatabase();
      winstonLogger.info('Success dropping database in non-production node environment');
    } catch (err) {
      log.steps.push({
        message: 'Error dropping database',
        metadata: {
          errorStack: err.stack,
        },
      });

      winstonLogger.warn('Error dropping database', log);
      throw err;
    }
  }

  getCollection<T>(collectionName: string): Collection<T> {
    if (!this.database) throw new Error('No database');
    return this.database.collection<T>(collectionName);
  }

  async disconnect() {
    await this.client.close();
  }
}
