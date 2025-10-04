import { INestApplication, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PostgreSqlPrismaOrmService extends PrismaClient implements OnModuleInit {
  constructor() {
    super({
      log: ['query'],
    });
  }

  async onModuleInit() {
    Logger.log('Connecting with database...');
    await this.$connect();
  }

  async enableShutdownHooks(app: INestApplication) {
    this.$on('beforeExit', async () => {
      Logger.log('Closing app before database shutdown...');
      await app.close();
    });
  }
}
