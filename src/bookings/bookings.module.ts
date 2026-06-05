import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Schedule } from 'src/schedules/entity/schedule.entity';
import { User } from 'src/users/entity/user.entity';
import { BookingsController } from './bookings.controller';
import { BookingsService } from './bookings.service';
import { Booking } from './entity/booking.entity';
import { RedisLockService } from './redis-lock.service';

@Module({
  imports: [TypeOrmModule.forFeature([Booking, Schedule, User])],
  controllers: [BookingsController],
  providers: [BookingsService, RedisLockService],
  exports: [BookingsService],
})
export class BookingsModule {}
