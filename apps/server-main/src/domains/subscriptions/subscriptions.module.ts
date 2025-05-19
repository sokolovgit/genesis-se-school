import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { WeatherModule } from '../weather/weather.module';
import { EmailsModule } from '../emails/emails.module';

import { SubscriptionsService } from './subscriptions.service';
import { SubscriptionsController } from './subscriptions.controller';
import { SubscriptionsDailyUpdatesInitService } from './subscriptions-daily-updates-init.service';
import { SubscriptionsHourlyUpdatesInitService } from './subscriptions-hourly-updates-init.service';

import { SubscriptionsQueue } from './subscriptions.queue-definition';

import { SendDailyUpdatesProcessor } from './processors/send-daily-updates.processor';
import { SendHourlyUpdatesProcessor } from './processors/send-hourly-updates.processor';
import { ProcessWeatherUpdateChunkProcessor } from './processors/process-weather-update-chunk.processor';

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
      {
        name: SubscriptionsQueue.ProcessWeatherUpdateChunk,
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
    ProcessWeatherUpdateChunkProcessor,
  ],
  exports: [],
})
export class SubscriptionsModule {}
