import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Schedule } from 'src/schedules/entity/schedule.entity';
import { User } from 'src/users/entity/user.entity';
import { BookingsController } from './bookings.controller';
import { BookingsService } from './bookings.service';
import { Booking } from './entity/booking.entity';
import { PaymentsController } from './payments.controller';
import { RedisLockService } from './redis-lock.service';
import { StripePaymentsService } from './stripe-payments.service';

@Module({
  imports: [TypeOrmModule.forFeature([Booking, Schedule, User])],
  controllers: [BookingsController, PaymentsController],
  providers: [BookingsService, RedisLockService, StripePaymentsService],
  exports: [BookingsService],
})
export class BookingsModule {}
