import { ConflictException, Injectable } from '@nestjs/common';
import { SubscriptionsRepository } from '@database/domains/subscriptions/repositories/subscriptions.repository';
import { WeatherService } from '../weather/weather.service';
import { UpdatesFrequency } from '@/database/domains/subscriptions/enums/updates-frequency.enum';
import { SubscriptionTokensRepository } from '@/database/domains/subscriptions/repositories/subscription-tokens.repository';
import { EmailsService } from '../emails/emails.service';
import { Uuid } from '@/commons';
import { Subscription } from '@/database/domains/subscriptions/entities/subscribtion.entity';

@Injectable()
export class SubscriptionsService {
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
}
