import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class LoginUserDto {
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim().toLowerCase() : value,
  )
  @IsString()
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
