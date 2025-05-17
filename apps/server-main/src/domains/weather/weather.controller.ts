import { Controller, Get, Query, ValidationPipe } from '@nestjs/common';
import { WeatherDto } from './dtos/weather.dto';
import { GetWeatherDto } from './dtos/get-weather.dto';

import { WeatherService } from './weather.service';

@Controller('weather')
export class WeatherController {
  constructor(private readonly weatherService: WeatherService) {}

  @Get()
  public async getWeather(
    @Query(new ValidationPipe({ transform: true }))
    getWeatherDto: GetWeatherDto,
  ) {
    const weather = await this.weatherService.getWeatherByCityName(getWeatherDto.city);

    return new WeatherDto(weather);
  }
}
