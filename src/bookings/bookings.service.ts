import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import type { UUID } from 'crypto';
import { DayOfWeek } from 'src/schedules/enum/dayOfWeek.enum';
import { Schedule } from 'src/schedules/entity/schedule.entity';
import { User } from 'src/users/entity/user.entity';
import { Role } from 'src/utils/enum/role.enum';
import { ILike, Repository } from 'typeorm';
import { CreateBookingDto } from './dto/create-booking.dto';
import { Booking } from './entity/booking.entity';
import { BookingStatus } from './enum/booking-status.enum';
import { RedisLockService } from './redis-lock.service';

@Injectable()
export class BookingsService {
  constructor(
    @InjectRepository(Booking)
    private bookingsRepository: Repository<Booking>,
    @InjectRepository(Schedule)
    private schedulesRepository: Repository<Schedule>,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private redisLockService: RedisLockService,
  ) {}

  async create(
    patientId: string,
    createBookingDto: CreateBookingDto,
  ): Promise<Booking> {
    await this.validateUserRole(patientId, Role.PATIENT, 'Patient');
    await this.validateUserRole(
      createBookingDto.doctorId,
      Role.DOCTOR,
      'Doctor',
    );

    if (patientId === createBookingDto.doctorId) {
      throw new BadRequestException('Patient cannot book themselves');
    }

    const appointmentDay = this.getDayOfWeek(createBookingDto.appointmentDate);
    const schedule = await this.schedulesRepository.findOne({
      where: {
        doctor: { userId: createBookingDto.doctorId as UUID },
        dayOfWeek: appointmentDay,
      },
      relations: { doctor: true },
    });

    if (!schedule) {
      throw new NotFoundException(
        `Doctor does not have a schedule on ${appointmentDay}`,
      );
    }

    const endTime = this.validateRequestedSlot(
      schedule,
      createBookingDto.startTime,
    );

    const lock = await this.redisLockService.acquire(
      this.getBookingLockKey(createBookingDto),
    );

    if (!lock) {
      throw new ConflictException('This slot is currently being booked');
    }

    try {
      const existingBooking = await this.bookingsRepository.findOne({
        where: {
          doctor: { userId: createBookingDto.doctorId as UUID },
          appointmentDate: createBookingDto.appointmentDate,
          startTime: createBookingDto.startTime,
          status: BookingStatus.BOOKED,
        },
      });

      if (existingBooking) {
        throw new ConflictException('This slot is already booked');
      }

      const booking = this.bookingsRepository.create({
        doctor: { userId: createBookingDto.doctorId as UUID },
        patient: { userId: patientId as UUID },
        schedule: { scheduleId: schedule.scheduleId },
        appointmentDate: createBookingDto.appointmentDate,
        startTime: createBookingDto.startTime,
        endTime,
        status: BookingStatus.BOOKED,
      });

      return await this.bookingsRepository.save(booking);
    } finally {
      await this.redisLockService.release(lock);
    }
  }

  async findPatientBookings(patientId: string): Promise<Booking[]> {
    await this.validateUserRole(patientId, Role.PATIENT, 'Patient');

    return await this.bookingsRepository.find({
      where: { patient: { userId: patientId as UUID } },
      relations: { doctor: true, schedule: true },
      order: { appointmentDate: 'ASC', startTime: 'ASC' },
    });
  }

  async cancel(
    patientId: string,
    bookingId: string,
  ): Promise<{ cancelled: boolean }> {
    const booking = await this.bookingsRepository.findOne({
      where: {
        bookingId: bookingId as UUID,
        patient: { userId: patientId as UUID },
      },
    });

    if (!booking) {
      throw new NotFoundException(`Booking with id ${bookingId} not found`);
    }

    if (booking.status === BookingStatus.CANCELLED) {
      return { cancelled: true };
    }

    booking.status = BookingStatus.CANCELLED;
    await this.bookingsRepository.save(booking);

    return { cancelled: true };
  }

  private async validateUserRole(
    userId: string,
    role: Role,
    label: string,
  ): Promise<void> {
    const user = await this.usersRepository.findOne({
      where: {
        userId: userId as UUID,
        roles: ILike(`%${role}%`),
      },
    });

    if (!user) {
      throw new NotFoundException(`${label} with id ${userId} not found`);
    }
  }

  private validateRequestedSlot(schedule: Schedule, startTime: string): string {
    if (!schedule.startTime || !schedule.endTime || !schedule.slotDuration) {
      throw new BadRequestException('Schedule is incomplete');
    }

    const scheduleStart = this.toMinutes(schedule.startTime);
    const scheduleEnd = this.toMinutes(schedule.endTime);
    const slotStart = this.toMinutes(startTime);
    const slotEnd = slotStart + schedule.slotDuration;

    if (slotStart < scheduleStart || slotEnd > scheduleEnd) {
      throw new BadRequestException(
        'Requested slot is outside doctor schedule',
      );
    }

    if ((slotStart - scheduleStart) % schedule.slotDuration !== 0) {
      throw new BadRequestException(
        'Requested slot must align with doctor slot duration',
      );
    }

    const isInsideBreak = (schedule.breaks ?? []).some((scheduleBreak) => {
      const breakStart = this.toMinutes(scheduleBreak.start);
      const breakEnd = this.toMinutes(scheduleBreak.end);

      return slotStart < breakEnd && slotEnd > breakStart;
    });

    if (isInsideBreak) {
      throw new BadRequestException('Requested slot overlaps a schedule break');
    }

    return this.toTime(slotEnd);
  }

  private getBookingLockKey(createBookingDto: CreateBookingDto): string {
    return [
      'booking-lock',
      createBookingDto.doctorId,
      createBookingDto.appointmentDate,
      createBookingDto.startTime,
    ].join(':');
  }

  private getDayOfWeek(date: string): DayOfWeek {
    const parsedDate = new Date(`${date}T00:00:00.000Z`);

    if (
      Number.isNaN(parsedDate.getTime()) ||
      parsedDate.toISOString().slice(0, 10) !== date
    ) {
      throw new BadRequestException('appointmentDate must be a valid date');
    }

    const days = [
      DayOfWeek.SUNDAY,
      DayOfWeek.MONDAY,
      DayOfWeek.TUESDAY,
      DayOfWeek.WEDNESDAY,
      DayOfWeek.THURSDAY,
      DayOfWeek.FRIDAY,
      DayOfWeek.SATURDAY,
    ];

    return days[parsedDate.getUTCDay()];
  }

  private toMinutes(time: string): number {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  }

  private toTime(totalMinutes: number): string {
    const hours = Math.floor(totalMinutes / 60)
      .toString()
      .padStart(2, '0');
    const minutes = (totalMinutes % 60).toString().padStart(2, '0');

    return `${hours}:${minutes}`;
  }
}
