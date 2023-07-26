/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */

import { INestApplication, Logger, ValidationPipe, VersioningType } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { configDto } from '@peerlab/researchers/peers/adapters/config.dto';
import { ApiModule } from '@peerlab/researchers/peers/adapters/controllers/rest-api/api.module';
import { NativeLogger } from '@peerlab/researchers/peers/core/shared/logs/native-logger';
import { version } from '@peerlab/root/package.json';
import { spawn } from 'child_process';
import { exit } from 'process';
import { ApiKeyGuard } from './guards/api-key.guard';
import { mainDescriptionMarkdown } from './main.docs';

const applicationLogger = new NativeLogger();

// Function to execute the migration command
const runMigration = async () => {
  const command = 'npx';
  const args = [
    'prisma',
    'migrate',
    'deploy',
    '--schema',
    'libs/researchers/peers/adapters/src/database/infra/prisma/postgresql.schema.prisma',
  ];

  return new Promise<void>((resolve, reject) => {
    const databaseProvider = process.env['DATABASE_PROVIDER'];
    if (databaseProvider === 'postgresql-prisma-orm') {
      const child = spawn(command, args, { stdio: 'inherit', shell: true });
      child.on('close', (code) => {
        if (code === 0) {
          applicationLogger.log('Migration executed successfully', { fileName: 'main.ts', function: 'runMigration' });
          resolve();
        } else {
          applicationLogger.error(`Migration process failed.`, { errorCode: code });
          reject();
        }
      });
    } else {
      applicationLogger.log(`No migration needed for ${databaseProvider} database provider`, {
        fileName: 'main.ts',
        function: 'runMigration',
      });
      resolve();
    }
  });
};

const setupOpenApi = (app: INestApplication) => {
  // Setting up Swagger document
  const options = new DocumentBuilder()
    .setTitle('Peers RESTful API')
    .setDescription(mainDescriptionMarkdown)
    .setVersion(version)
    .build();

  const document = SwaggerModule.createDocument(app, options);
  SwaggerModule.setup('docs', app, document);
};

// npx prisma migrate deploy --schema libs/researchers/peers/adapters/src/database/infra/prisma/postgresql.schema.prisma

const bootstrap = async () => {
  const app = await NestFactory.create(ApiModule, {
    logger: new NativeLogger(),
  });

  // Enable CORS for specific domains
  app.enableCors({
    origin:
      /^(?:https?:\/\/)?.*\.my\.domain|^(?:https?:\/\/)?localhost(:\d+)?|^(?:https?:\/\/)?(my-project-).*-my-team\.vercel\.app/,
  });

  // Use pipes on all routes
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true, // With this option set to true, we no longer need to specify types with the @Type decorator;
      },
    })
  );

  // Use guards on all routes
  app.useGlobalGuards(new ApiKeyGuard());

  // Enable versioning
  app.enableVersioning({
    type: VersioningType.URI,
  });

  // Setting up Swagger document
  setupOpenApi(app);

  // Listen on specified port
  const port = configDto.applicationPort;
  await app.listen(port);
  Logger.log(`🚀 Service API is running on: http://localhost:${port}`, 'bootstrap');
  Logger.log(`🚀 Swagger API is running on: http://localhost:${port}/docs`, 'bootstrap');
  Logger.log(`2023-07-24T22:52:00.000Z UTC-03:00`, `bootstrap`);
};

// Call the function to execute the migration
runMigration()
  .then(() => {
    // Further actions or start your NestJS app here if needed
    bootstrap();
  })
  .catch((error) => {
    Logger.error('Error during migration:', error);
    // Handle error gracefully
    exit(1);
  });
