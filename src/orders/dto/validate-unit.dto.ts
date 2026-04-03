import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, Min } from 'class-validator';
import type { UUID } from 'crypto';

export class ValidateUnitDto {
  @ApiProperty({ example: 'uuid-of-outlet' })
  @IsNotEmpty()
  outletId: UUID;

  @ApiProperty({ example: 5 })
  @IsInt()
  @Min(1)
  unitNumber: number;
}
