import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { EmailsQueue } from './emails.queue-definition';
import { EmailsService } from './emails.service';
import { SendEmailProcessor } from './send-email.processor';

@Module({
  imports: [
    BullModule.registerQueue({
      name: EmailsQueue.SendEmail,
    }),
  ],

  providers: [EmailsService, SendEmailProcessor],
  exports: [EmailsService],
})
export class EmailsModule {}
