import { Weather } from '../interfaces/weather.interface';

export class WeatherDto {
  temperature: number;

  humidity: number;

  weatherDescription: string;

  constructor(weather: Weather) {
    this.temperature = weather.temperature;
    this.humidity = weather.humidity;
    this.weatherDescription = weather.weatherDescription;
  }
}
