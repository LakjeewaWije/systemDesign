import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, Length, IsPhoneNumber } from 'class-validator';

export class AddPropertyDto {
  @ApiProperty({
    example: 'Grand Palace Hotel',
    description: 'Name of the property (hotel, villa, cabana, etc.)',
  })
  @IsString()
  @Length(2, 255)
  name: string;

  @ApiProperty({
    example: '123 Beach Road',
    required: false,
  })
  @IsOptional()
  @IsString()
  @Length(0, 500)
  address?: string;

  @ApiProperty({
    example: 'Colombo',
    required: false,
  })
  @IsOptional()
  @IsString()
  @Length(0, 255)
  city?: string;

  @ApiProperty({
    example: 'Sri Lanka',
    required: false,
  })
  @IsOptional()
  @IsString()
  @Length(0, 255)
  country?: string;

  @ApiProperty({
    example: '+94112223344',
    required: false,
  })
  @IsOptional()
  @IsPhoneNumber()
  phone?: string;
}
