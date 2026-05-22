import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsUUID, Matches } from 'class-validator';

export class CreateBookingDto {
  @IsUUID()
  @IsNotEmpty()
  @ApiProperty({ example: '98466c69-de90-4f9b-af90-c7f7c391e24a' })
  doctorId!: string;

  @Matches(/^\d{4}-\d{2}-\d{2}$/)
  @IsNotEmpty()
  @ApiProperty({ example: '2026-05-25' })
  appointmentDate!: string;

  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/)
  @IsNotEmpty()
  @ApiProperty({ example: '09:30' })
  startTime!: string;
}
