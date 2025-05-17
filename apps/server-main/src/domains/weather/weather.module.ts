import { Module } from '@nestjs/common';
import { WeatherController } from './weather.controller';
import { HttpModule } from '@nestjs/axios';
import { WeatherService } from './weather.service';

@Module({
  imports: [HttpModule],
  controllers: [WeatherController],
  providers: [WeatherService],
})
export class WeatherModule {}
