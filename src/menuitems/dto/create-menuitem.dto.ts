import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Length,
  Min,
} from 'class-validator';
import type { UUID } from 'crypto';

export class CreateMenuitemDto {
  @ApiProperty({ example: 'Chicken Burger' })
  @IsNotEmpty()
  @IsString()
  @Length(2, 255)
  name: string;

  @ApiProperty({ example: 'Delicious grilled chicken burger', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: 15.99 })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  price: number;

  @ApiProperty({ example: ['uuid1', 'uuid2'], type: [String] })
  @IsArray()
  @IsNotEmpty()
  outletIds: UUID[];
}
