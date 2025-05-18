import { ConfigService } from '@nestjs/config';
import { createBullBoard } from '@bull-board/api';
import { INestApplication } from '@nestjs/common';

import { BullMQAdapter } from '@bull-board/api/bullMQAdapter';
import { ExpressAdapter } from '@bull-board/express';

import { Queue } from 'bullmq';
import { EmailsQueue } from '@/domains/emails/emails.queue-definition';
import { SubscriptionsQueue } from '@/domains/subscriptions/subscriptions.queue-definition';

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

  const sendHourlyWeatherUpdatesQueue = new Queue(
    SubscriptionsQueue.HourlyUpdates,
    {
      connection: redisConnection,
    },
  );
  const sendDailyWeatherUpdatesQueue = new Queue(
    SubscriptionsQueue.DailyUpdates,
    {
      connection: redisConnection,
    },
  );

  const serverAdapter = new ExpressAdapter();

  serverAdapter.setBasePath(`/${bullBoardPath}`);

  createBullBoard({
    queues: [
      new BullMQAdapter(sendEmailsQueue),
      new BullMQAdapter(sendHourlyWeatherUpdatesQueue),
      new BullMQAdapter(sendDailyWeatherUpdatesQueue),
    ],
    serverAdapter,
  });

  app.use(`/${bullBoardPath}`, serverAdapter.getRouter());
};
