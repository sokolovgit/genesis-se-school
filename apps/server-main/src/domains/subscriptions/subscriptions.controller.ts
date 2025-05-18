import {
  Get,
  Body,
  Post,
  Param,
  HttpCode,
  Controller,
  ParseUUIDPipe,
} from '@nestjs/common';
import { Uuid } from '@/commons';

import { SubscribeDto } from './dtos/subscribe.dto';
import { SubscriptionsService } from './subscriptions.service';

@Controller()
export class SubscriptionsController {
  constructor(private readonly subscriptionsService: SubscriptionsService) {}

  @Post('subscribe')
  @HttpCode(200)
  public async subscribe(@Body() subscribeDto: SubscribeDto) {
    await this.subscriptionsService.subscribe(
      subscribeDto.email,
      subscribeDto.city,
      subscribeDto.frequency,
    );

    return 'Subscription successful. Confirmation email sent.';
  }

  @Get('confirm/:token')
  public async confirm(@Param('token', new ParseUUIDPipe()) token: Uuid) {
    await this.subscriptionsService.confirm(token);
    return 'Subscription confirmed successfully.';
  }

  @Get('unsubscribe/:token')
  public async unsubscribe(@Param('token', new ParseUUIDPipe()) token: Uuid) {
    await this.subscriptionsService.unsubscribe(token);
    return 'Unsubscribed successfully.';
  }
}
