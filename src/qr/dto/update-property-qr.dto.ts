import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { CommonStatus } from 'src/utils/enum/commonStatus.enum';

export class UpdatePropertyQrDto {
  @ApiProperty({ example: CommonStatus.ACTIVE, enum: CommonStatus })
  @IsEnum(CommonStatus)
  status: CommonStatus;
}
