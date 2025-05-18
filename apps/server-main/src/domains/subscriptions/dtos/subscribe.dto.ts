import { IsEmail, IsEnum, IsNotEmpty, IsString } from 'class-validator';

import { UpdatesFrequency } from '@/database/domains/subscriptions/enums/updates-frequency.enum';

export class SubscribeDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  city: string;

  @IsEnum(UpdatesFrequency)
  @IsNotEmpty()
  frequency: UpdatesFrequency;
}
