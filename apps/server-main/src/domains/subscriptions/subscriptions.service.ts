import { BadRequestException, Injectable } from '@nestjs/common';
import { SubscriptionsRepository } from '@database/domains/subscriptions/repositories/subscriptions.repository';
import { WeatherService } from '../weather/weather.service';
import { UpdatesFrequency } from '@/database/domains/subscriptions/enums/updates-frequency.enum';
import { SubscriptionTokensRepository } from '@/database/domains/subscriptions/repositories/subscription-tokens.repository';

@Injectable()
export class SubscriptionsService {
  constructor(
    private readonly subscriptionsRepository: SubscriptionsRepository,
    private readonly subscriptionTokensRepository: SubscriptionTokensRepository,
    private readonly wheatherService: WeatherService,
  ) {}

  async subscribe(email: string, city: string, frequency: UpdatesFrequency) {
    const checkedCityName =
      await this.wheatherService.getValidCityNameOrThrow(city);

    const existingSubscription =
      await this.subscriptionsRepository.findActiveSubscriptionByEmailAndCity(
        email,
        checkedCityName,
      );

    if (existingSubscription && existingSubscription.frequency === frequency) {
      throw new BadRequestException('Invalid input');
    }

    if (existingSubscription) {
      await this.subscriptionsRepository.setSubscriptionFrequencyById(
        existingSubscription.id,
        frequency,
      );

      return;
    }

    const subscription =
      await this.subscriptionsRepository.createByEmailCityAndFrequency(
        email,
        checkedCityName,
        frequency,
      );

    const subscriptionToken =
      await this.subscriptionTokensRepository.createUnactivatedTokenBySubscriptionId(
        subscription.id,
      );

    // send email with token
  }
}
