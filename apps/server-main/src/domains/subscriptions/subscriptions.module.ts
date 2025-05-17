import { Module } from '@nestjs/common';
import { SubscriptionsController } from './subscriptions.controller';
import { SubscriptionsService } from './subscriptions.service';
import { WeatherModule } from '../weather/weather.module';
import { EmailsModule } from '../emails/emails.module';

@Module({
  imports: [EmailsModule, WeatherModule],
  controllers: [SubscriptionsController],
  providers: [SubscriptionsService],
  exports: [],
})
export class SubscriptionsModule {}
