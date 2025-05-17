import { Module } from '@nestjs/common';
import { SubscriptionsController } from './subscriptions.controller';
import { SubscriptionsService } from './subscriptions.service';
import { WeatherModule } from '../weather/weather.module';
import { EmailsModule } from '../emails/emails.module';
import { SubscriptionsDailyUpdatesInitService } from './subscriptions-daily-updates-init.service';
import { SubscriptionsHourlyUpdatesInitService } from './subscriptions-hourly-updates-init.service';
import { SendDailyUpdatesProcessor } from './processors/send-daily-updates.processor';
import { SendHourlyUpdatesProcessor } from './processors/send-hourly-updates.processor';
import { BullModule } from '@nestjs/bullmq';
import { SubscriptionsQueue } from './subscriptions.queue-definition';

@Module({
  imports: [
    EmailsModule,
    WeatherModule,
    BullModule.registerQueue(
      {
        name: SubscriptionsQueue.DailyUpdates,
      },
      {
        name: SubscriptionsQueue.HourlyUpdates,
      },
    ),
  ],
  controllers: [SubscriptionsController],
  providers: [
    SubscriptionsService,
    SubscriptionsDailyUpdatesInitService,
    SubscriptionsHourlyUpdatesInitService,
    SendDailyUpdatesProcessor,
    SendHourlyUpdatesProcessor,
  ],
  exports: [],
})
export class SubscriptionsModule {}
