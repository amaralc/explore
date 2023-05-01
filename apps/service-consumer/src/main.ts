import { configDto } from '@adapters/config.dto';
import { ConsumerModule } from '@adapters/controllers/consumer/consumer.module';
import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions } from '@nestjs/microservices';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    ConsumerModule,
    configDto.nestJsMicroservicesOptions
  );
  await app.listen();
  Logger.log(
    `🚀 Service consumer is running in process ${configDto.eventsConsumerPort} without exposing ports`,
    'bootstrap'
  );
}

bootstrap();
