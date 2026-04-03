import { ApiProperty } from '@nestjs/swagger';
import { IsInt, Min } from 'class-validator';

export class AddUnitsRangeDto {
  @ApiProperty({ example: 1 })
  @IsInt()
  @Min(1)
  startNumber: number;

  @ApiProperty({ example: 100 })
  @IsInt()
  @Min(1)
  endNumber: number;
}
