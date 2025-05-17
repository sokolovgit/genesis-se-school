import { AbstractEntity, Uuid } from '@/commons';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';

import { Subscription } from './subscribtion.entity';

@Entity('subscription_tokens')
export class SubscriptionToken extends AbstractEntity {
  @Column({
    name: 'isActivated',
    type: 'boolean',
    default: false,
  })
  isActivated: boolean;

  @Column({
    name: 'subscription_id',
    type: 'uuid',
  })
  subscriptionId: Uuid;

  @JoinColumn({
    name: 'subscription_id',
  })
  @ManyToOne(
    () => Subscription,
    (subscription: Subscription) => subscription.tokens,
    {
      onDelete: 'CASCADE',
    },
  )
  subscription: Subscription;
}
