import { Body, Controller, Post } from '@nestjs/common';
import { SubscriptionsService } from './subscriptions.service';

import { SubscribeDto } from './dtos/subscribe.dto';

@Controller()
export class SubscriptionsController {
  constructor(private readonly subscriptionsService: SubscriptionsService) {}

  @Post('subscribe')
  public async subscribe(@Body() subscribeDto: SubscribeDto) {
    await this.subscriptionsService.subscribe(
      subscribeDto.email,
      subscribeDto.city,
      subscribeDto.frequency,
    );

    return 'Subscription successful. Confirmation email sent.';
  }
}
