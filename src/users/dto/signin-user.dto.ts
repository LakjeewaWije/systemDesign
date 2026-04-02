import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class SignInUserDto {
  @IsEmail()
  @IsNotEmpty()
  @ApiProperty({
    example: 'string@gmail.com',
  })
  emailAddress: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  password: string;
}
