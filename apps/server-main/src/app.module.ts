import * as path from 'path';
import config from './config';

import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WeatherModule } from '@domains/weather/weather.module';
import { SubscriptionsDomainModule } from '@/database/domains/subscriptions/subscriptions.domain-module';
import { SubscriptionsModule } from '@domains/subscriptions/subscriptions.module';
import { BullModule } from '@nestjs/bullmq';
import { EmailsModule } from './domains/emails/emails.module';
import { CacheModule } from '@nestjs/cache-manager';
import { createKeyv } from '@keyv/redis';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [config],
    }),

    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        url: configService.get('database.url'),
        entities: [
          path.resolve(__dirname, 'database/domains/**/*.entity.{js,ts}'),
        ],
        migrations: [path.resolve(__dirname, 'database/migrations/*.{js,ts}')],
        migrationsRun: false,
        logging: configService.get('database.logging'),
        synchronize: false,
      }),
    }),

    BullModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        connection: {
          host: configService.get<string>('redis.host'),
          port: configService.get<number>('redis.port'),
        },
      }),
    }),

    CacheModule.registerAsync({
      isGlobal: true,
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        return {
          stores: [
            createKeyv(
              `redis://${configService.get('redis.host')}:${configService.get('redis.port')}`,
            ),
          ],
        };
      },
    }),

    EmailsModule,
    WeatherModule,
    SubscriptionsDomainModule,
    SubscriptionsModule,
  ],

  controllers: [],
  providers: [],
})
export class AppModule {}
