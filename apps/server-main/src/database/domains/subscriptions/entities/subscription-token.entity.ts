import { AbstractEntity, Uuid } from '@/commons';
import { Column, Entity, JoinColumn, OneToOne } from 'typeorm';

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
  @OneToOne(() => Subscription, (subscription) => subscription.token)
  subscription: Subscription;
}
