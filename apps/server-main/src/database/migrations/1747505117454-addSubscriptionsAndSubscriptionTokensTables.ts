import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddSubscriptionsAndSubscriptionTokensTables1747505117454
  implements MigrationInterface
{
  name = 'AddSubscriptionsAndSubscriptionTokensTables1747505117454';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            CREATE TYPE "public"."updates_frequency" AS ENUM('hourly', 'daily')
        `);
    await queryRunner.query(`
            CREATE TABLE "subscriptions" (
                "comment" character varying,
                "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "deleted_at" TIMESTAMP WITH TIME ZONE,
                "version" integer NOT NULL DEFAULT '0',
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "email" character varying NOT NULL,
                "frequency" "public"."updates_frequency" NOT NULL,
                "city" character varying NOT NULL,
                CONSTRAINT "PK_a87248d73155605cf782be9ee5e" PRIMARY KEY ("id")
            )
        `);
    await queryRunner.query(`
            CREATE TABLE "subscription_tokens" (
                "comment" character varying,
                "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "deleted_at" TIMESTAMP WITH TIME ZONE,
                "version" integer NOT NULL DEFAULT '0',
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "isActivated" boolean NOT NULL DEFAULT false,
                "subscription_id" uuid NOT NULL,
                CONSTRAINT "PK_2dd83c1e48daf4a9b2e75e625d5" PRIMARY KEY ("id")
            )
        `);
    await queryRunner.query(`
            ALTER TABLE "subscription_tokens"
            ADD CONSTRAINT "FK_da23e109fce0c96f5fe63094c75" FOREIGN KEY ("subscription_id") REFERENCES "subscriptions"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "subscription_tokens" DROP CONSTRAINT "FK_da23e109fce0c96f5fe63094c75"
        `);
    await queryRunner.query(`
            DROP TABLE "subscription_tokens"
        `);
    await queryRunner.query(`
            DROP TABLE "subscriptions"
        `);
    await queryRunner.query(`
            DROP TYPE "public"."updates_frequency"
        `);
  }
}
