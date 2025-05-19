import { Queue } from 'bullmq';
import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { ConfigService } from '@nestjs/config';

import { createTransport, Transporter } from 'nodemailer';

import { EmailsQueue } from './emails.queue-definition';
import { SendEmailOptions } from './interfaces/send-email-options.interface';
import { SendEmailJobData } from './interfaces/send-email.job-data.interface';

@Injectable()
export class EmailsService {
  transporter: Transporter;

  constructor(
    @InjectQueue(EmailsQueue.SendEmail)
    private readonly sendEmailQueue: Queue<SendEmailJobData>,
    private readonly configService: ConfigService,
  ) {
    const username = this.configService.get<string>('smtp.username');
    const password = this.configService.get<string>('smtp.password');

    this.transporter = createTransport({
      host: this.configService.get<string>('smtp.host'),
      port: this.configService.get<number>('smtp.port'),
      secure: this.configService.get<boolean>('smtp.secure'),
      requireTLS: this.configService.get<boolean>('smtp.requireTLS'),
      auth:
        username && password
          ? {
              user: username,
              pass: password,
            }
          : undefined,
    });
  }

  async sendEmail(to: string, content: string, options: SendEmailOptions) {
    await this.transporter.sendMail({
      from: options.from ?? this.configService.get<string>('mailSender'),
      to,
      subject: options.subject,
      html: options.contentType === 'html' ? content : undefined,
      text: options.contentType === 'plain' ? content : undefined,
    });
  }

  async createSendEmailJob(data: SendEmailJobData) {
    await this.sendEmailQueue.add('send-email', data, {
      backoff: {
        type: 'exponential',
        delay: 1000,
      },
      removeOnComplete: 1000,
      removeOnFail: 5000,
    });
  }

  async createSendEmailJobsBulk(data: SendEmailJobData[]) {
    await this.sendEmailQueue.addBulk(
      data.map((job) => ({
        name: 'send-email',
        data: job,
        opts: {
          backoff: {
            type: 'exponential',
            delay: 1000,
          },
          removeOnComplete: 1000,
          removeOnFail: 5000,
        },
      })),
    );
  }
}
