import { Processor, WorkerHost } from '@nestjs/bullmq';
import { SubscriptionsQueue } from '../subscriptions.queue-definition';
import { SubscriptionsService } from '../subscriptions.service';
import { UpdatesFrequency } from '@/database/domains/subscriptions/enums/updates-frequency.enum';

@Processor(SubscriptionsQueue.HourlyUpdates)
export class SendHourlyUpdatesProcessor extends WorkerHost {
  constructor(private readonly subscriptionsService: SubscriptionsService) {
    super();
  }

  async process() {
    await this.subscriptionsService.sendWeatherUpdates(UpdatesFrequency.HOURLY);
  }
}
