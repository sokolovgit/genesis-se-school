import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { Weather } from './interfaces/weather.interface';
import { AxiosError } from 'axios';
import { catchError, firstValueFrom } from 'rxjs';
import {
  WeatherApiError,
  CurrentWeatherApiResponse,
} from './interfaces/weather-api-response.interface';

const WEATHER_API_BASE_URL = 'https://api.weatherapi.com/v1/current.json';

@Injectable()
export class WeatherService {
  private readonly apiKey: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.apiKey = this.configService.get<string>('weatherApiKey');
  }

  async getWeather(city: string): Promise<Weather> {
    const wheatherData = await this.getWeatherDataOrThrow(city);

    return {
      temperature: wheatherData.current.temp_c,
      humidity: wheatherData.current.humidity,
      weatherDescription: wheatherData.current.condition.text,
    };
  }

  async getValidCityNameOrThrow(city: string) {
    const weatherData = await this.getWeatherDataOrThrow(city);

    const foundCity = weatherData.location.name.toLowerCase();

    const isSameCity = foundCity !== city.toLowerCase();

    if (!isSameCity) {
      throw new BadRequestException('Invalid input');
    }

    return foundCity;
  }

  private async getWeatherDataOrThrow(city: string) {
    const { data } = await firstValueFrom(
      this.httpService
        .get<CurrentWeatherApiResponse>(WEATHER_API_BASE_URL, {
          params: {
            key: this.apiKey,
            q: city,
          },
        })
        .pipe(
          catchError((error: AxiosError<WeatherApiError>) => {
            const code = error.response?.data?.error.code;

            if (code === 1006) {
              throw new NotFoundException('City not found');
            }

            throw new BadRequestException('Invalid request');
          }),
        ),
    );

    return data;
  }
}
