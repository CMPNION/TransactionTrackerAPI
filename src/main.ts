global.crypto = require('crypto');
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { config } from 'dotenv';
import * as cookieParser from 'cookie-parser';
import { ExpressAdapter } from '@bull-board/express';
import { createBullBoard } from '@bull-board/api';
import { BullAdapter } from '@bull-board/api/bullAdapter';
import { getQueueToken } from '@nestjs/bull';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

config();

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );
  app.use(cookieParser());

  // Bull Board
  const serverAdapter = new ExpressAdapter();
  serverAdapter.setBasePath('/admin/queues');

  const { addQueue, removeQueue, setQueues } = createBullBoard({
    queues: [new BullAdapter(app.get(getQueueToken('balance')))],
    serverAdapter,
  });

  const expressApp = app.getHttpAdapter();
  expressApp.use('/admin/queues', serverAdapter.getRouter());

  //swagger
  const config = new DocumentBuilder()
    .setTitle('FinTrackerAPI') // Название API
    .setDescription('Documentation API') // Описание API
    .setVersion('1.0') // Версия API
    .addBearerAuth() // Добавляем поддержку JWT
    .build();

  // Создание документации
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document); // Эндпоинт для Swagger


  await app.listen(process.env.PORT ?? 3000);
}

bootstrap();
