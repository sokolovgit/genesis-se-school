import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { SubscriptionsRepository } from '@database/domains/subscriptions/repositories/subscriptions.repository';
import { WeatherService } from '../weather/weather.service';
import { UpdatesFrequency } from '@/database/domains/subscriptions/enums/updates-frequency.enum';
import { SubscriptionTokensRepository } from '@/database/domains/subscriptions/repositories/subscription-tokens.repository';
import { EmailsService } from '../emails/emails.service';
import { Uuid } from '@/commons';
import { Subscription } from '@/database/domains/subscriptions/entities/subscribtion.entity';
import { Weather } from '../weather/interfaces/weather.interface';

const CHUNK_SIZE = 100;

@Injectable()
export class SubscriptionsService {
  logger = new Logger(SubscriptionsService.name);

  constructor(
    private readonly emailsService: EmailsService,
    private readonly weatherService: WeatherService,
    private readonly subscriptionsRepository: SubscriptionsRepository,
    private readonly subscriptionTokensRepository: SubscriptionTokensRepository,
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

    await this.sendConfirmationEmail(email, {
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
    const activeSubscriptionsCount =
      await this.subscriptionsRepository.getActiveSubscriptionsCountByFrequency(
        frequency,
      );

    for (let i = 0; i < activeSubscriptionsCount; i += CHUNK_SIZE) {
      const subscriptions =
        await this.subscriptionsRepository.getActiveSubscriptionsByFrequencyPaginated(
          frequency,
          {
            skip: i,
            take: CHUNK_SIZE,
          },
        );

      const emailsPromises = subscriptions.map(async (subscription) => {
        try {
          const weatherData = await this.weatherService.getWeatherByCityName(
            subscription.city,
          );

          await this.sendWeatherUpdateEmail(
            subscription.email,
            subscription.city,
            weatherData,
          );
        } catch (error) {
          this.logger.error(
            `Failed to send weather update email to ${subscription.email}: ${error}`,
          );
        }
      });

      await Promise.all(emailsPromises);
    }
  }

  private async sendConfirmationEmail(
    email: string,
    data: {
      token: Uuid;
      city: string;
      frequency: UpdatesFrequency;
    },
  ) {
    const content = `
      <h1>Confirm your subscription</h1>
      <p>Click the link below to confirm your subscription:</p>
      <h2>token: ${data.token}</h1>
      <h2>Link: <a href="${'localhost:3000/api'}/confirm/${data.token}">Confirm Subscription</a></h2>
      <p>City: ${data.city}</p>
      <p>Frequency: ${data.frequency}</p>
      
      <p>If you didn't subscribe, you can ignore this email.</p>
      `;

    await this.emailsService.createSendEmailJob({
      to: email,
      subject: 'Confirm your subscription',
      content,
      contentType: 'html',
    });
  }

  private async sendWeatherUpdateEmail(
    email: string,
    city: string,
    weather: Weather,
  ) {
    const content = `
      <h1>Weather Update</h1>
      <p>City: ${city}</p>
      
      <p>Temperature: ${weather.temperature}°C</p>
      <p>Humidity: ${weather.humidity}%</p>
      <p>Weather Description: ${weather.weatherDescription}</p>
      `;

    await this.emailsService.createSendEmailJob({
      to: email,
      subject: 'Weather Update',
      content,
      contentType: 'html',
    });
  }
}
