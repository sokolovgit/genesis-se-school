import { AppModule } from './app.module';
import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { showBullBoard } from './plugins/bullboard';
import { createDocument } from './plugins/swagger';
import { Logger, ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const logger = new Logger();

  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('api');

  app.enableCors();

  app.useGlobalPipes(new ValidationPipe());

  const config = app.get(ConfigService);
  const port = config.get<string>('port');

  const isDocsEnabled = config.get<boolean>('docs.enabled');

  if (isDocsEnabled) {
    createDocument(app);
  }

  const isBullBoardEnabled = config.get<boolean>('bullboard.enabled');

  if (isBullBoardEnabled) {
    showBullBoard(app);
  }

  await app.listen(port);

  const appUrl = await app.getUrl();

  logger.log(`🚀 Application is running on: ${appUrl}`);

  if (isDocsEnabled) {
    const docsPath = config.get<string>('docs.path');
    logger.log(`📚 API Docs are available at: ${appUrl}/${docsPath}`);
  }

  if (isBullBoardEnabled) {
    const bullBoardPath = config.get<string>('bullboard.path');
    logger.log(`📊 Bull Board is available at: ${appUrl}/${bullBoardPath}`);
  }
}

// eslint-disable-next-line @typescript-eslint/no-floating-promises
bootstrap();
