import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, Matches } from 'class-validator';

export class ScheduleBreakDto {
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/)
  @IsNotEmpty()
  @ApiProperty({ example: '13:00' })
  start?: string;

  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/)
  @IsNotEmpty()
  @ApiProperty({ example: '14:00' })
  end?: string;
}
