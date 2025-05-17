import { Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Subscription } from '../entities/subscribtion.entity';
import { UpdatesFrequency } from '../enums/updates-frequency.enum';
import { Uuid } from '@/commons';

@Injectable()
export class SubscriptionsRepository {
  constructor(
    @InjectRepository(Subscription)
    private readonly subscriptionRepository: Repository<Subscription>,
  ) {}

  async findById(id: Uuid): Promise<Subscription | undefined> {
    return await this.subscriptionRepository.findOne({
      where: { id },
    });
  }

  async findActiveSubscriptionByEmailAndCity(
    email: string,
    city: string,
  ): Promise<Subscription | undefined> {
    const qb = this.subscriptionRepository.createQueryBuilder('subscription');

    qb.leftJoinAndSelect('subscription.tokens', 'token');
    qb.where('subscription.email = :email', { email });
    qb.andWhere('subscription.city = :city', { city });
    qb.andWhere('token.id IS NOT NULL');
    qb.andWhere('token.isActivated = :isActivated', { isActivated: true });

    const result = await qb.getOne();

    if (!result) {
      return;
    }

    return result;
  }

  async findInactiveSubscription(
    email: string,
    city: string,
    frequency: UpdatesFrequency,
  ): Promise<Subscription | undefined> {
    const qb = this.subscriptionRepository.createQueryBuilder('subscription');
    qb.leftJoinAndSelect('subscription.tokens', 'token');
    qb.where('subscription.email = :email', { email });
    qb.andWhere('subscription.city = :city', { city });
    qb.andWhere('subscription.frequency = :frequency', { frequency });
    qb.andWhere('token.id IS NOT NULL');
    qb.andWhere('token.isActivated = :isActivated', { isActivated: false });

    qb.limit(1);
    qb.orderBy('token.createdAt', 'DESC');

    const result = await qb.getOne();

    if (!result) {
      return;
    }

    return result;
  }

  async setSubscriptionFrequencyById(id: Uuid, frequency: UpdatesFrequency) {
    await this.subscriptionRepository.update(id, {
      frequency,
    });

    return await this.findById(id);
  }

  async createByEmailCityAndFrequency(
    email: string,
    city: string,
    frequency: UpdatesFrequency,
  ): Promise<Subscription> {
    const subscription = this.subscriptionRepository.create({
      email,
      city,
      frequency,
    });

    return await this.subscriptionRepository.save(subscription);
  }
}
