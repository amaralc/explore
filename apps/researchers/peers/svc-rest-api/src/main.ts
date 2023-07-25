/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */

import { INestApplication, Logger, ValidationPipe, VersioningType } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { configDto } from '@peerlab/researchers/peers/adapters/config.dto';
import { ApiModule } from '@peerlab/researchers/peers/adapters/controllers/rest-api/api.module';
import { version } from '@peerlab/root/package.json';
import { ApiKeyGuard } from './guards/api-key.guard';
import { mainDescriptionMarkdown } from './main.docs';

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

const bootstrap = async () => {
  const app = await NestFactory.create(ApiModule);

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

bootstrap();
