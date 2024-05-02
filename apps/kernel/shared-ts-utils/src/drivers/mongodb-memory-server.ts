import { MongoMemoryReplSet } from 'mongodb-memory-server';
import { ILogMetadata } from '../logs/application-logger';
import { nativeLogger } from '../logs/native-logger';

export class MongoDbMemoryServer {
  mongoMemoryReplicaSet?: MongoMemoryReplSet;
  mongoUri?: string;

  async create() {
    this.mongoMemoryReplicaSet = await MongoMemoryReplSet.create({ replSet: { count: 1 } });
    this.mongoUri = this.mongoMemoryReplicaSet.getUri();
    return this.mongoMemoryReplicaSet;
  }

  getUri(): string {
    if (!this.mongoUri) {
      throw new Error('No memory server created');
    }

    return this.mongoUri;
  }

  async stop() {
    await this.mongoMemoryReplicaSet.stop();
  }

  static async initializeInMemoryDatabase(): Promise<{ databaseUri: string; mongoMemoryServer: MongoDbMemoryServer }> {
    const log: ILogMetadata = {
      scope: { moduleName: MongoDbMemoryServer.name, methodName: 'initializeInMemoryDatabase' },
      steps: [],
    };
    const mongoMemoryServer = new MongoDbMemoryServer();
    log.steps.push({ message: 'Initializing in memory database...' });

    await mongoMemoryServer.create();
    const databaseUri = mongoMemoryServer.getUri();
    nativeLogger.info(`In memory database uri: ${databaseUri}`, log);
    return { databaseUri, mongoMemoryServer };
  }
}
