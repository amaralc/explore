import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions } from '@nestjs/microservices';
import { configDto } from '@peerlab/researchers/peers/adapters/config.dto';
import { ConsumerModule } from '@peerlab/researchers/peers/adapters/controllers/consumer/consumer.module';

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
