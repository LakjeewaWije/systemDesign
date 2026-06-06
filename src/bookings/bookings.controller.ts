import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import type { Request } from 'express';
import { AuthGuard } from 'src/auth/auth.guard';
import { Roles } from 'src/utils/customDecorators/roles.decorator';
import { Role } from 'src/utils/enum/role.enum';
import { RolesGuard } from 'src/utils/roles.guard';
import { BookingsService } from './bookings.service';
import { CreateBookingDto } from './dto/create-booking.dto';

@UseGuards(AuthGuard, RolesGuard)
@ApiBearerAuth()
@ApiTags('bookings')
@Controller('bookings')
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  @Roles(Role.PATIENT)
  @Post()
  @ApiOperation({ summary: 'Book a doctor slot from their schedule' })
  async create(
    @Body() createBookingDto: CreateBookingDto,
    @Req() req: Request,
  ) {
    return await this.bookingsService.create(
      this.getAuthUserId(req),
      createBookingDto,
    );
  }

  @Roles(Role.PATIENT)
  @Get()
  @ApiOperation({ summary: 'Get authenticated patient bookings' })
  async findPatientBookings(@Req() req: Request) {
    return await this.bookingsService.findPatientBookings(
      this.getAuthUserId(req),
    );
  }

  @Roles(Role.PATIENT)
  @Post('/:bookingId/sync-payment')
  @ApiOperation({
    summary: 'Sync authenticated patient booking payment status',
  })
  async syncPayment(
    @Param('bookingId', ParseUUIDPipe) bookingId: string,
    @Req() req: Request,
  ) {
    return await this.bookingsService.syncBookingPayment(
      this.getAuthUserId(req),
      bookingId,
    );
  }

  @Roles(Role.PATIENT)
  @Delete('/:bookingId')
  @ApiOperation({ summary: 'Cancel authenticated patient booking' })
  async cancel(
    @Param('bookingId', ParseUUIDPipe) bookingId: string,
    @Req() req: Request,
  ) {
    return await this.bookingsService.cancel(
      this.getAuthUserId(req),
      bookingId,
    );
  }

  private getAuthUserId(req: Request): string {
    return req['user'].userId;
  }
}
