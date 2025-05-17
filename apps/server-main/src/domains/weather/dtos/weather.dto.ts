import { ApiProperty } from '@nestjs/swagger';
import { Weather } from '../interfaces/weather.interface';

export class WeatherDto {
  @ApiProperty({
    name: 'temperature',
    description: 'Current temperature',
  })
  temperature: number;

  @ApiProperty({
    name: 'humidity',
    description: 'Current humidity percentage',
  })
  humidity: number;

  @ApiProperty({
    name: 'weatherDescription',
    description: 'Weather description',
  })
  weatherDescription: string;

  constructor(weather: Weather) {
    this.temperature = weather.temperature;
    this.humidity = weather.humidity;
    this.weatherDescription = weather.weatherDescription;
  }
}
