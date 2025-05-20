import { PaginationOptions } from '@/commons';
import { UpdatesFrequency } from '@/database/domains/subscriptions/enums/updates-frequency.enum';

export interface ProcessWeatherUpdateChunkJobData {
  frequency: UpdatesFrequency;
  paginationOptions: PaginationOptions;
}
