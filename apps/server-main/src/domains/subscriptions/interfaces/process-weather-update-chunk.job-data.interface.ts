import { UpdatesFrequency } from '@/database/domains/subscriptions/enums/updates-frequency.enum';

export interface ProcessWeatherUpdateChunkJobData {
  frequency: UpdatesFrequency;
  skip: number;
  take: number;
}
