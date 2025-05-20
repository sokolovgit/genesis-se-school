import { Job } from 'bullmq';
import { Processor, WorkerHost } from '@nestjs/bullmq';

import { SubscriptionsQueue } from '../subscriptions.queue-definition';
import { SubscriptionsService } from '../subscriptions.service';
import { ProcessWeatherUpdateChunkJobData } from '../interfaces/process-weather-update-chunk.job-data.interface';

@Processor(SubscriptionsQueue.ProcessWeatherUpdateChunk)
export class ProcessWeatherUpdateChunkProcessor extends WorkerHost {
  constructor(private readonly subscriptionsService: SubscriptionsService) {
    super();
  }

  async process(job: Job<ProcessWeatherUpdateChunkJobData, void, string>) {
    const { frequency, paginationOptions } = job.data;

    await this.subscriptionsService.processWeatherUpdateChunk(
      frequency,
      paginationOptions,
    );
  }
}
