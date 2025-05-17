import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class GetWeatherDto {
  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    name: 'city',
    description: 'City name for weather forecast',
    required: true,
    example: 'Kyiv',
  })
  city: string;
}
