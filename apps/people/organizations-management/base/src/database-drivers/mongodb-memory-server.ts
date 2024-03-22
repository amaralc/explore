import { MongoMemoryReplSet } from 'mongodb-memory-server';

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

  static async initializeInMemoryDatabase() {
    const mongoMemoryServer = new MongoDbMemoryServer();
    console.log('Initializing in memory database');
    await mongoMemoryServer.create();
    const databaseUri = mongoMemoryServer.getUri();
    console.log('In memory database uri:', databaseUri);
    return databaseUri;
  }
}
