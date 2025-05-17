import { InjectQueue } from '@nestjs/bullmq';
import { Injectable, OnModuleInit } from '@nestjs/common';
import { SubscriptionsQueue } from './subscriptions.queue-definition';
import { Queue } from 'bullmq';

@Injectable()
export class SubscriptionsHourlyUpdatesInitService implements OnModuleInit {
  constructor(
    @InjectQueue(SubscriptionsQueue.HourlyUpdates)
    private readonly subscriptionsHourlyUpdatesQueue: Queue,
  ) {}

  async onModuleInit() {
    const schedulers =
      await this.subscriptionsHourlyUpdatesQueue.getJobSchedulers();

    for (const scheduler of schedulers) {
      if (scheduler.name === 'subscriptions-hourly-updates') {
        await this.subscriptionsHourlyUpdatesQueue.removeJobScheduler(
          scheduler.key,
        );
      }
    }

    await this.subscriptionsHourlyUpdatesQueue.upsertJobScheduler(
      'subscriptions-hourly-updates-scheduler',
      { pattern: '0 * * * *' }, // Repeat the job every hour
      {
        name: 'subscriptions-hourly-updates',
        data: {},
        opts: {
          attempts: 3,
          backoff: { type: 'exponential', delay: 5000 },
          removeOnComplete: true,
          removeOnFail: 100,
        },
      },
    );

    await this.subscriptionsHourlyUpdatesQueue.setGlobalConcurrency(1);
  }
}
