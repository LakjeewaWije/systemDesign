import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsEmail, IsNotEmpty, IsString, Validate } from 'class-validator';
import { IsValidMobileNumber } from 'src/utils/customValidators/mobileNumber.validator';

export class SignUpUserDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  firstName: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  lastName: string;

  @IsEmail()
  @IsNotEmpty()
  @ApiProperty({
    example: 'string@gmail.com',
  })
  emailAddress: string;

  @Transform(({ value }) => value.replace(/\s/g, ''))
  @IsString()
  @Validate(IsValidMobileNumber)
  @IsNotEmpty()
  @ApiProperty({
    example: '+94776679707',
  })
  mobilePhone: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  password: string;
}
