import { AbstractEntity } from '@/commons';
import { Column, Entity, OneToMany } from 'typeorm';

import { UpdatesFrequency } from '../enums/updates-frequency.enum';
import { SubscriptionToken } from './subscription-token.entity';

@Entity('subscriptions')
export class Subscription extends AbstractEntity {
  @Column({
    type: 'varchar',
    name: 'email',
  })
  email: string;

  @Column({
    name: 'frequency',
    type: 'enum',
    enumName: 'updates_frequency',
    enum: UpdatesFrequency,
  })
  frequency: UpdatesFrequency;

  @Column({
    name: 'city',
    type: 'varchar',
  })
  city: string;

  @OneToMany(() => SubscriptionToken, (token) => token.subscription, {
    cascade: true,
    eager: true,
  })
  tokens: SubscriptionToken[];
}
