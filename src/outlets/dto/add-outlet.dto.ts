import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsString, Length } from 'class-validator';
import { OutletType } from '../enum/outletType.enum';

export class CreateOutletDto {
  @ApiProperty({
    example: 'Main Restaurant',
    description: 'Name of the outlet',
  })
  @IsString()
  @Length(2, 255)
  name: string;

  @ApiProperty({
    example: OutletType.RESTAURANT,
    enum: OutletType,
    description: 'Type of outlet',
  })
  @IsEnum(OutletType)
  type: OutletType;
}
