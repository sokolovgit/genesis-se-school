import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Inject,
  Logger,
} from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';

import { AxiosError } from 'axios';
import { catchError, firstValueFrom } from 'rxjs';

import {
  WeatherApiError,
  CurrentWeatherApiResponse,
} from './interfaces/weather-api-response.interface';
import { Weather } from './interfaces/weather.interface';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

const WEATHER_API_BASE_URL = 'https://api.weatherapi.com/v1/current.json';
const MINUTE_IN_MILLIS = 60 * 1000;

@Injectable()
export class WeatherService {
  private readonly apiKey: string;

  // Using a map to track in-flight requests for the same city.
  // In future, redlock can be used
  private readonly inFlightRequests = new Map<
    string,
    Promise<CurrentWeatherApiResponse>
  >();

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
  ) {
    this.apiKey = this.configService.get<string>('weatherApiKey');
  }

  async getWeatherByCityName(city: string): Promise<Weather> {
    const wheatherData = await this.getWeatherDataOrThrow(city);

    return {
      temperature: wheatherData.current.temp_c,
      humidity: wheatherData.current.humidity,
      weatherDescription: wheatherData.current.condition.text,
    };
  }

  async getValidCityNameOrThrow(city: string) {
    const weatherData = await this.getWeatherDataOrThrow(city);

    const foundCity = weatherData.location.name;

    const isSameCity = foundCity.toLowerCase() === city.toLowerCase();

    if (!isSameCity) {
      throw new BadRequestException('Invalid input');
    }

    return foundCity;
  }

  private async getWeatherDataOrThrow(
    city: string,
  ): Promise<CurrentWeatherApiResponse> {
    const logger = new Logger(WeatherService.name);
    const cacheKey = `weather:${city.toLowerCase()}`;
    logger.log(`Cache key: ${cacheKey}`);

    const cached =
      await this.cacheManager.get<CurrentWeatherApiResponse>(cacheKey);
    if (cached) {
      logger.log(`Cache hit for city: ${city}`);
      return cached;
    }

    if (this.inFlightRequests.has(cacheKey)) {
      logger.log(`Waiting for in-flight request for city: ${city}`);
      return this.inFlightRequests.get(cacheKey);
    }

    const requestPromise = this.fetchAndCacheWeatherData(
      cacheKey,
      city,
    ).finally(() => {
      this.inFlightRequests.delete(cacheKey);
    });

    this.inFlightRequests.set(cacheKey, requestPromise);

    return requestPromise;
  }

  private async fetchAndCacheWeatherData(
    cacheKey: string,
    city: string,
  ): Promise<CurrentWeatherApiResponse> {
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

    await this.cacheManager.set(cacheKey, data, MINUTE_IN_MILLIS * 10);

    return data;
  }
}
