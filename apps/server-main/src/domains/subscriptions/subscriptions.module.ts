import { Module } from '@nestjs/common';
import { SubscriptionsController } from './subscriptions.controller';
import { SubscriptionsService } from './subscriptions.service';
import { WeatherModule } from '../weather/weather.module';

@Module({
  imports: [WeatherModule],
  controllers: [SubscriptionsController],
  providers: [SubscriptionsService],
  exports: [],
})
export class SubscriptionsModule {}
