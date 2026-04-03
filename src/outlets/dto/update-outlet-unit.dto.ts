import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';
import { CommonStatus } from 'src/utils/enum/commonStatus.enum';
import { BookingStatus } from 'src/utils/enum/bookingStatus.enum';

export class UpdateOutletUnitDto {
  @ApiPropertyOptional({
    example: CommonStatus.ACTIVE,
    enum: CommonStatus,
  })
  @IsOptional()
  @IsEnum(CommonStatus)
  status?: CommonStatus;

  @ApiPropertyOptional({
    example: BookingStatus.AVAILABLE,
    enum: BookingStatus,
  })
  @IsOptional()
  @IsEnum(BookingStatus)
  bookingStatus?: BookingStatus;
}
