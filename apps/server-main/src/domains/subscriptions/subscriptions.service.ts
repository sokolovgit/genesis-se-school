import {
  Logger,
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { Uuid } from '@/commons';
import { Queue } from 'bullmq';
import { InjectQueue } from '@nestjs/bullmq';
import { UpdatesFrequency } from '@/database/domains/subscriptions/enums/updates-frequency.enum';

import { SubscriptionsRepository } from '@database/domains/subscriptions/repositories/subscriptions.repository';
import { SubscriptionTokensRepository } from '@/database/domains/subscriptions/repositories/subscription-tokens.repository';

import { ConfigService } from '@nestjs/config';
import { EmailsService } from '../emails/emails.service';
import { WeatherService } from '../weather/weather.service';

import { Weather } from '../weather/interfaces/weather.interface';
import { Subscription } from '@/database/domains/subscriptions/entities/subscribtion.entity';
import { SubscriptionsQueue } from './subscriptions.queue-definition';
import { ProcessWeatherUpdateChunkJobData } from './interfaces/process-weather-update-chunk.job-data.interface';

const CHUNK_SIZE = 100;

@Injectable()
export class SubscriptionsService {
  logger = new Logger(SubscriptionsService.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly emailsService: EmailsService,
    private readonly weatherService: WeatherService,

    private readonly subscriptionsRepository: SubscriptionsRepository,
    private readonly subscriptionTokensRepository: SubscriptionTokensRepository,

    @InjectQueue(SubscriptionsQueue.ProcessWeatherUpdateChunk)
    private readonly processWeatherUpdateChunkQueue: Queue<ProcessWeatherUpdateChunkJobData>,
  ) {}

  async subscribe(email: string, city: string, frequency: UpdatesFrequency) {
    const checkedCityName =
      await this.weatherService.getValidCityNameOrThrow(city);

    const existingActiveSubscription =
      await this.subscriptionsRepository.findActiveSubscriptionByEmailAndCity(
        email,
        checkedCityName,
      );

    if (existingActiveSubscription) {
      throw new ConflictException('Email already subscribed');
    }

    let subscription: Subscription;

    const existingInactiveSubscription =
      await this.subscriptionsRepository.findInactiveSubscription(
        email,
        checkedCityName,
        frequency,
      );

    if (existingInactiveSubscription) {
      subscription = existingInactiveSubscription;
    } else {
      subscription =
        await this.subscriptionsRepository.createByEmailCityAndFrequency(
          email,
          checkedCityName,
          frequency,
        );
    }

    const subscriptionToken =
      await this.subscriptionTokensRepository.createInactivatedTokenBySubscriptionId(
        subscription.id,
      );

    await this.addSendConfirmationEmailJob(email, {
      token: subscriptionToken.id,
      city: checkedCityName,
      frequency,
    });
  }

  async confirm(token: Uuid) {
    const subscriptionToken =
      await this.subscriptionTokensRepository.findInactiveTokenWithSubscriptionByTokenId(
        token,
      );

    if (!subscriptionToken) {
      throw new NotFoundException('Token not found');
    }

    const isLastToken =
      await this.subscriptionTokensRepository.isLastTokenForSubscriptionByTokenId(
        token,
      );

    if (!isLastToken) {
      throw new BadRequestException('Invalid token');
    }

    await this.subscriptionTokensRepository.setTokenStateActivatedByTokenId(
      token,
    );
  }

  async unsubscribe(token: Uuid) {
    const subscriptionToken =
      await this.subscriptionTokensRepository.findByTokenIdWithSubscription(
        token,
      );

    if (!subscriptionToken) {
      throw new NotFoundException('Token not found');
    }

    if (!subscriptionToken.isActivated) {
      throw new BadRequestException('Invalid token');
    }

    await this.subscriptionTokensRepository.setTokenStateDeactivatedByTokenId(
      token,
    );
  }

  async sendWeatherUpdates(frequency: UpdatesFrequency) {
    const totalSubscriptions =
      await this.subscriptionsRepository.getGroupedActiveSubscriptionsCount(
        frequency,
      );

    for (let i = 0; i < totalSubscriptions; i += CHUNK_SIZE) {
      const skip = i;
      const take = Math.min(CHUNK_SIZE, totalSubscriptions - i);

      await this.addProcessWeatherUpdateChunkJob(frequency, skip, take);
    }
  }

  async processWeatherUpdateChunk(
    frequency: UpdatesFrequency,
    skip: number,
    take: number,
  ) {
    const groupedSubscriptions =
      await this.subscriptionsRepository.getGroupedActiveSubscriptionsByFrequencyPaginated(
        frequency,
        { skip, take },
      );

    const jobsData: {
      email: string;
      weatherReports: {
        city: string;
        weather: Weather;
        token: string;
      }[];
    }[] = [];

    await Promise.all(
      groupedSubscriptions.map(async ({ email, cityTokenPairs }) => {
        try {
          const weatherResults = await Promise.allSettled(
            cityTokenPairs.map(({ city, token }) =>
              this.weatherService.getWeatherByCityName(city).then((data) => ({
                city,
                weather: data,
                token,
              })),
            ),
          );

          const fulfilledReports = weatherResults
            .filter(
              (
                result,
              ): result is PromiseFulfilledResult<{
                city: string;
                weather: Weather;
                token: string;
              }> => result.status === 'fulfilled',
            )
            .map((result) => result.value);

          weatherResults
            .filter((result) => result.status === 'rejected')
            .forEach((result, index) => {
              this.logger.error(
                `Failed to fetch weather for ${cityTokenPairs[index].city}: ${result.reason}`,
              );
            });

          if (fulfilledReports.length === 0) return;

          jobsData.push({
            email,
            weatherReports: fulfilledReports,
          });
        } catch (error) {
          this.logger.error(
            `Failed to process weather update for ${email}: ${error}`,
          );
        }
      }),
    );

    if (jobsData.length > 0) {
      await this.addSendCombinedWeatherUpdateEmailJobsBulk(jobsData);
    }
  }

  private buildConfirmationEmailContent(
    city: string,
    token: Uuid,
    frequency: UpdatesFrequency,
  ) {
    const appUrl = this.configService.get<string>('deployedUrl');

    return `
      <h1>Confirm your subscription</h1>
      <p>Click the link below to confirm your subscription:</p>
      <h2>token: ${token}</h1>
      <h2>Link: <a href="${appUrl}/confirm/${token}">Confirm Subscription</a></h2>
      <p>City: ${city}</p>
      <p>Frequency: ${frequency}</p>
      
      <p>If you didn't subscribe, you can ignore this email.</p>
    `;
  }

  private async addSendConfirmationEmailJob(
    email: string,
    data: {
      token: Uuid;
      city: string;
      frequency: UpdatesFrequency;
    },
  ) {
    const content = this.buildConfirmationEmailContent(
      data.city,
      data.token,
      data.frequency,
    );

    await this.emailsService.createSendEmailJob({
      to: email,
      subject: 'Confirm your subscription',
      content,
      contentType: 'html',
    });
  }

  private buildWeatherUpdateContent(
    weatherReports: {
      city: string;
      weather: Weather;
      token: string;
    }[],
  ) {
    return weatherReports
      .map(({ city, weather, token }) => {
        const appUrl = this.configService.get<string>('deployedUrl');

        return `
            <h1>Weather Update for ${city}</h1>
            <p>Temperature: ${weather.temperature}°C</p>
            <p>Humidity: ${weather.humidity}%</p>
            <p>Description: ${weather.weatherDescription}</p>
            <h2>Link: <a href="${appUrl}/unsubscribe/${token}">Unsubscribe from updates for ${city}</a></h2>
          `;
      })
      .join('');
  }

  private async addSendCombinedWeatherUpdateEmailJobsBulk(
    jobsData: {
      email: string;
      weatherReports: {
        city: string;
        weather: Weather;
        token: string;
      }[];
    }[],
  ) {
    await this.emailsService.createSendEmailJobsBulk(
      jobsData.map(({ email, weatherReports }) => ({
        to: email,
        subject: 'Weather Update',
        content: this.buildWeatherUpdateContent(weatherReports),
        contentType: 'html',
      })),
    );
  }

  private async addProcessWeatherUpdateChunkJob(
    frequency: UpdatesFrequency,
    skip: number,
    take: number,
  ) {
    await this.processWeatherUpdateChunkQueue.add(
      'process-weather-update-chunk',
      {
        frequency,
        skip,
        take,
      },
      {
        removeOnComplete: 1000,
        removeOnFail: 5000,
      },
    );
  }
}
