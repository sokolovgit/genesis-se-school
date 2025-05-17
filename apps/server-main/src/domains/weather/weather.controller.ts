import { Controller, Get, Query, ValidationPipe } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiOkResponse,
  ApiNotFoundResponse,
  ApiBadRequestResponse,
} from '@nestjs/swagger';

import { WeatherDto } from './dtos/weather.dto';
import { GetWeatherDto } from './dtos/get-weather.dto';

import { WeatherService } from './weather.service';

@ApiTags('weather')
@Controller('weather')
export class WeatherController {
  constructor(private readonly weatherService: WeatherService) {}

  @ApiOperation({
    summary: 'Get current weather for a city',
    description:
      'Returns the current weather forecast for the specified city using WeatherAPI.com.',
  })
  @ApiOkResponse({
    description: 'Successful operation - current weather forecast returned',
    type: WeatherDto,
  })
  @ApiBadRequestResponse({
    description: 'Invalid request',
  })
  @ApiNotFoundResponse({
    description: 'City not found',
  })
  @Get()
  public async getWeather(
    @Query(new ValidationPipe({ transform: true }))
    getWeatherDto: GetWeatherDto,
  ) {
    const weather = await this.weatherService.getWeather(getWeatherDto.city);

    return new WeatherDto(weather);
  }
}
