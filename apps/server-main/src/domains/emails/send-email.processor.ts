import { Job } from 'bullmq';
import { Processor, WorkerHost } from '@nestjs/bullmq';

import { EmailsQueue } from './emails.queue-definition';
import { EmailsService } from './emails.service';

import { SendEmailJobData } from './interfaces/send-email.job-data.interface';

@Processor(EmailsQueue.SendEmail)
export class SendEmailProcessor extends WorkerHost {
  constructor(private readonly emailsService: EmailsService) {
    super();
  }

  async process(job: Job<SendEmailJobData, void, string>): Promise<void> {
    const { to, subject, content, contentType } = job.data;

    await this.emailsService.sendEmail(to, content, {
      subject,
      contentType,
    });
  }
}
