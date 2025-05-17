import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  ValidationPipe,
} from '@nestjs/common';
import { SubscriptionsService } from './subscriptions.service';

import { SubscribeDto } from './dtos/subscribe.dto';
import { Uuid } from '@/commons';

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

  @Get('confirm/:token')
  public async confirm(
    @Param('token', new ValidationPipe({ transform: true })) token: Uuid,
  ) {
    await this.subscriptionsService.confirm(token);

    return 'Subscription confirmed successfully.';
  }
}
