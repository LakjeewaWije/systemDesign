import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  Length,
  Min,
} from 'class-validator';
import { CommonStatus } from 'src/utils/enum/commonStatus.enum';
import type { UUID } from 'crypto';

export class UpdateMenuitemDto {
  @ApiPropertyOptional({ example: 'Chicken Burger' })
  @IsOptional()
  @IsString()
  @Length(2, 255)
  name?: string;

  @ApiPropertyOptional({ example: 'Delicious grilled chicken burger' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ example: 15.99 })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  price?: number;

  @ApiPropertyOptional({
    example: CommonStatus.ACTIVE,
    enum: CommonStatus,
  })
  @IsOptional()
  @IsEnum(CommonStatus)
  status?: CommonStatus;

  @ApiPropertyOptional({ example: ['uuid1', 'uuid2'], type: [String] })
  @IsOptional()
  @IsArray()
  outletIds?: UUID[];
}
