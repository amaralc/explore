import { Collection, Db, MongoClient } from 'mongodb';
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

  getCollection<T>(collectionName: string): Collection<T> {
    if (!this.database) throw new Error('No database');
    return this.database.collection<T>(collectionName);
  }

  async disconnect() {
    await this.client.close();
  }
}
