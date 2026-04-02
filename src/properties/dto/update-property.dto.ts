import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsOptional,
  IsString,
  Length,
  IsPhoneNumber,
  IsEnum,
} from 'class-validator';
import { CommonStatus } from 'src/utils/enum/commonStatus.enum';

export class UpdatePropertyDto {
  @ApiPropertyOptional({ example: 'Grand Palace Hotel' })
  @IsOptional()
  @IsString()
  @Length(2, 255)
  name?: string;

  @ApiPropertyOptional({ example: '123 Beach Road' })
  @IsOptional()
  @IsString()
  @Length(0, 500)
  address?: string;

  @ApiPropertyOptional({ example: 'Colombo' })
  @IsOptional()
  @IsString()
  @Length(0, 255)
  city?: string;

  @ApiPropertyOptional({ example: 'Sri Lanka' })
  @IsOptional()
  @IsString()
  @Length(0, 255)
  country?: string;

  @ApiPropertyOptional({ example: '+94112223344' })
  @IsOptional()
  @IsPhoneNumber()
  phone?: string;

  @ApiPropertyOptional({
    example: CommonStatus.INACTIVE,
    description: 'Set property active/inactive',
  })
  @IsOptional()
  @IsEnum(CommonStatus)
  status?: CommonStatus;
}
