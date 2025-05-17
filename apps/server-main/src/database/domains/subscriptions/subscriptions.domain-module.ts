import { Global, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Subscription } from './entities/subscribtion.entity';
import { SubscriptionsRepository } from './repositories/subscriptions.repository';
import { SubscriptionTokensRepository } from './repositories/subscription-tokens.repository';
import { SubscriptionToken } from './entities/subscription-token.entity';

@Global()
@Module({
  imports: [TypeOrmModule.forFeature([Subscription, SubscriptionToken])],
  providers: [SubscriptionsRepository, SubscriptionTokensRepository],
  exports: [SubscriptionsRepository, SubscriptionTokensRepository],
})
export class SubscriptionsDomainModule {}
