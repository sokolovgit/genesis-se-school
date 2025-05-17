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

    return {
      temperature: data.current.temp_c,
      humidity: data.current.humidity,
      weatherDescription: data.current.condition.text,
    };
  }
}
