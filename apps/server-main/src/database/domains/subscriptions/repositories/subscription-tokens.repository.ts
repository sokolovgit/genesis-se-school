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

  async findByTokenId(tokenId: Uuid): Promise<SubscriptionToken> {
    return await this.subscriptionTokenRepository.findOne({
      where: {
        id: tokenId,
      },
    });
  }

  async createInactivatedTokenBySubscriptionId(subscriptionId: Uuid) {
    const subscriptionToken = this.subscriptionTokenRepository.create({
      subscriptionId: subscriptionId,
    });

    return await this.subscriptionTokenRepository.save(subscriptionToken);
  }

  async findInactiveTokenWithSubscriptionByTokenId(tokenId: Uuid) {
    return await this.subscriptionTokenRepository.findOne({
      where: {
        id: tokenId,
        isActivated: false,
      },
      relations: {
        subscription: true,
      },
    });
  }

  async isLastTokenForSubscriptionByTokenId(tokenId: Uuid): Promise<boolean> {
    const qb = this.subscriptionTokenRepository.createQueryBuilder('t');

    qb.select('COUNT(*)', 'count');
    qb.where(
      't.subscriptionId = (SELECT sub.subscription_id FROM subscription_tokens sub WHERE sub.id = :tokenId)',
      { tokenId },
    );
    qb.andWhere(
      't.createdAt > (SELECT sub.created_at FROM subscription_tokens sub WHERE sub.id = :tokenId)',
      { tokenId },
    );

    const result: {
      count: string;
    } = await qb.getRawOne();

    return Number(result?.count ?? 0) === 0;
  }

  async setTokenStateActivatedByTokenId(
    tokenId: Uuid,
  ): Promise<SubscriptionToken> {
    await this.subscriptionTokenRepository.update(
      { id: tokenId },
      { isActivated: true },
    );

    return await this.findByTokenId(tokenId);
  }
}
