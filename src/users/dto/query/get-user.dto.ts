import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Matches,
  Max,
  Min,
} from 'class-validator';
import { Role } from 'src/utils/enum/role.enum';

export class UserQueryDto {
  @ApiProperty({ required: false })
  @IsOptional()
  mobilePhone?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  firstName?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  lastName?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  emailAddress?: string;

  @ApiProperty({ required: false, enum: Role })
  @IsOptional()
  @IsEnum(Role)
  @IsString()
  roles?: Role;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @Matches(/^[a-zA-Z]+,(asc|desc)$/i, {
    message: 'Invalid sort parameter. Format should be "field,order".',
  })
  sort?: string;

  @ApiProperty({ required: false, type: Number })
  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  @IsInt()
  @Min(1)
  pageNumber?: number;

  @ApiProperty({ required: false, type: Number })
  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  @IsInt()
  @Min(1)
  @Max(1000)
  pageSize?: number;
}
