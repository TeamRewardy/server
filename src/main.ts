import type { LogLevel } from '@nestjs/common';
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap(): Promise<void> {
  const LOG_LEVEL = (
    process.env.LOG_LEVEL || 'error,warn,log,debug,verbose'
  ).split(',') as LogLevel[];

  const app = await NestFactory.create(AppModule, {
    logger: LOG_LEVEL,
  });
  app.useGlobalPipes(new ValidationPipe());

  const port = 3020;
  await app.listen(port);
  console.log(`Application is running on: http://[::1]:${port}/graphql`);
}

bootstrap();
