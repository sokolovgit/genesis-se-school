import { InjectQueue } from '@nestjs/bullmq';
import { Injectable, OnModuleInit } from '@nestjs/common';
import { SubscriptionsQueue } from './subscriptions.queue-definition';
import { Queue } from 'bullmq';

@Injectable()
export class SubscriptionsDailyUpdatesInitService implements OnModuleInit {
  constructor(
    @InjectQueue(SubscriptionsQueue.DailyUpdates)
    private readonly subscriptionsDailyUpdatesQueue: Queue,
  ) {}

  async onModuleInit() {
    const schedulers =
      await this.subscriptionsDailyUpdatesQueue.getJobSchedulers();

    for (const scheduler of schedulers) {
      if (scheduler.name === 'subscriptions-daily-updates') {
        await this.subscriptionsDailyUpdatesQueue.removeJobScheduler(
          scheduler.key,
        );
      }
    }

    await this.subscriptionsDailyUpdatesQueue.upsertJobScheduler(
      'subscriptions-daily-updates-scheduler',
      // every day at 12:00
      { pattern: '0 12 * * *' },

      {
        name: 'subscriptions-daily-updates',
        data: {},
        opts: {
          removeOnComplete: 1000,
          removeOnFail: 5000,
        },
      },
    );

    await this.subscriptionsDailyUpdatesQueue.setGlobalConcurrency(1);
  }
}
