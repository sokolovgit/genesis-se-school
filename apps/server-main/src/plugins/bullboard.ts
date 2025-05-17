import { ConfigService } from '@nestjs/config';
import { INestApplication } from '@nestjs/common';

import { createBullBoard } from '@bull-board/api';
import { ExpressAdapter } from '@bull-board/express';
import { BullMQAdapter } from '@bull-board/api/bullMQAdapter';

import { Queue } from 'bullmq';
import { EmailsQueue } from '@/domains/emails/emails.queue-definition';

export const showBullBoard = (app: INestApplication): void => {
  const config = app.get(ConfigService);

  const redisConnection = {
    host: config.get<string>('redis.host'),
    port: config.get<number>('redis.port'),
  };

  const bullBoardPath = config.get<string>('bullboard.path');

  const sendEmailsQueue = new Queue(EmailsQueue.SendEmail, {
    connection: redisConnection,
  });

  const serverAdapter = new ExpressAdapter();

  serverAdapter.setBasePath(`/${bullBoardPath}`);

  createBullBoard({
    queues: [new BullMQAdapter(sendEmailsQueue)],
    serverAdapter,
  });

  app.use(`/${bullBoardPath}`, serverAdapter.getRouter());
};
