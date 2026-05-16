import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  IsArray,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  Matches,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';
import { DayOfWeek } from '../enum/dayOfWeek.enum';
import { ScheduleBreakDto } from './schedule-break.dto';

export class CreateScheduleDto {
  @IsEnum(DayOfWeek)
  @IsNotEmpty()
  @ApiProperty({ enum: DayOfWeek, example: DayOfWeek.MONDAY })
  dayOfWeek!: DayOfWeek;

  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/)
  @IsNotEmpty()
  @ApiProperty({ example: '09:00' })
  startTime!: string;

  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/)
  @IsNotEmpty()
  @ApiProperty({ example: '17:00' })
  endTime!: string;

  @IsInt()
  @Min(5)
  @Max(240)
  @ApiProperty({ example: 15 })
  slotDuration!: number;

  @IsArray()
  @ArrayMaxSize(10)
  @ValidateNested({ each: true })
  @Type(() => ScheduleBreakDto)
  @IsOptional()
  @ApiProperty({
    type: [ScheduleBreakDto],
    required: false,
    example: [{ start: '13:00', end: '14:00' }],
  })
  breaks?: ScheduleBreakDto[];
}
