import { Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { SubscriptionToken } from '../entities/subscription-token.entity';
import { Uuid } from '@/commons';

@Injectable()
export class SubscriptionTokensRepository {
  constructor(
    @InjectRepository(SubscriptionToken)
    private readonly subscriptionTokenRepository: Repository<SubscriptionToken>,
  ) {}

  async createInactivatedTokenBySubscriptionId(subscriptionId: Uuid) {
    const subscriptionToken = this.subscriptionTokenRepository.create({
      subscriptionId: subscriptionId,
    });

    return await this.subscriptionTokenRepository.save(subscriptionToken);
  }
}
