import { Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Subscription } from '../entities/subscribtion.entity';
import { UpdatesFrequency } from '../enums/updates-frequency.enum';
import { PaginationOptions, Uuid } from '@/commons';

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

  async getActiveSubscriptionsCountByFrequency(frequency: UpdatesFrequency) {
    const qb = this.subscriptionRepository.createQueryBuilder('subscription');

    qb.leftJoinAndSelect('subscription.tokens', 'token');
    qb.where('token.id IS NOT NULL');
    qb.andWhere('token.isActivated = :isActivated', { isActivated: true });
    qb.andWhere('subscription.frequency = :frequency', { frequency });

    return await qb.getCount();
  }
  async getGroupedActiveSubscriptionsByFrequencyPaginated(
    frequency: UpdatesFrequency,
    paginationOptions: PaginationOptions,
  ) {
    const qb = this.subscriptionRepository
      .createQueryBuilder('subscription')
      .leftJoin('subscription.tokens', 'token')
      .select([
        'subscription.email AS email',
        // Aggregate cities and tokens as an array of objects
        `json_agg(json_build_object('city', subscription.city, 'token', token.id)) AS city_token_pairs`,
      ])
      .where('token.id IS NOT NULL')
      .andWhere('token.isActivated = true')
      .andWhere('subscription.frequency = :frequency', { frequency })
      .groupBy('subscription.email')
      .orderBy('MIN(subscription.createdAt)', 'DESC')
      .skip(paginationOptions.skip)
      .take(paginationOptions.take);

    const rawResults: Array<{
      email: string;
      city_token_pairs: { city: string; token: string }[];
    }> = await qb.getRawMany();

    const formattedResults = rawResults.map((result) => {
      return {
        email: result.email,
        cityTokenPairs: result.city_token_pairs,
      };
    });

    return formattedResults;
  }

  async getGroupedActiveSubscriptionsCount(frequency: UpdatesFrequency) {
    const qb = this.subscriptionRepository
      .createQueryBuilder('subscription')
      .leftJoin('subscription.tokens', 'token')
      .where('token.id IS NOT NULL')
      .andWhere('token.isActivated = true')
      .andWhere('subscription.frequency = :frequency', { frequency })
      .select('COUNT(DISTINCT subscription.email)', 'count');

    const result: { count: string } | undefined = await qb.getRawOne();
    return result ? parseInt(result.count, 10) : 0;
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
