/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */

import { configDto } from '@adapters/config.dto';
import { ApiModule } from '@adapters/controllers/api/api.module';
import { INestApplication, Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ApiKeyGuard } from './guards/api-key.guard';

const setupOpenApi = (app: INestApplication) => {
  // Setting up Swagger document
  const options = new DocumentBuilder()
    .setTitle('nestjs-template-service rest-api')
    .setDescription('NestJS Template Service Description')
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, options);
  SwaggerModule.setup('docs', app, document);
};

const bootstrap = async () => {
  const app = await NestFactory.create(ApiModule);
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

  // Setting up Swagger document
  setupOpenApi(app);

  // Listen on specified port
  const port = configDto.applicationPort;
  await app.listen(port);
  Logger.log(`🚀 Service API is running on: http://localhost:${port}`, 'bootstrap');
};

bootstrap();
