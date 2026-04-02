import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString, Length } from 'class-validator';
import { CommonStatus } from 'src/utils/enum/commonStatus.enum';
import { OutletType } from '../enum/outletType.enum';

export class UpdateOutletDto {
  @ApiPropertyOptional({ example: 'Pool Bar' })
  @IsOptional()
  @IsString()
  @Length(2, 255)
  name?: string;

  @ApiPropertyOptional({
    example: OutletType.BAR,
    enum: OutletType,
  })
  @IsOptional()
  @IsEnum(OutletType)
  type?: OutletType;

  @ApiPropertyOptional({
    example: CommonStatus.INACTIVE,
    enum: CommonStatus,
  })
  @IsOptional()
  @IsEnum(CommonStatus)
  status?: CommonStatus;
}
