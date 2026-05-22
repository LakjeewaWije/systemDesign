import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import type { UUID } from 'crypto';
import { Repository } from 'typeorm';
import { DayOfWeek } from '../schedules/enum/dayOfWeek.enum';
import { Schedule } from '../schedules/entity/schedule.entity';
import { User } from '../users/entity/user.entity';
import { Role } from '../utils/enum/role.enum';
import { BookingsService } from './bookings.service';
import { Booking } from './entity/booking.entity';
import { BookingStatus } from './enum/booking-status.enum';

type MockRepository<T = unknown> = Partial<
  Record<keyof Repository<T>, jest.Mock>
>;

const createRepositoryMock = <T = unknown>(): MockRepository<T> => ({
  create: jest.fn((entity) => entity),
  find: jest.fn(),
  findOne: jest.fn(),
  save: jest.fn((entity) => Promise.resolve(entity)),
});

describe('BookingsService', () => {
  let service: BookingsService;
  let bookingsRepository: MockRepository<Booking>;
  let schedulesRepository: MockRepository<Schedule>;
  let usersRepository: MockRepository<User>;

  const patientId = '6cd35374-e0a4-4d8d-8e84-c32a9c0af287';
  const doctorId = '5783bd24-56ba-42fc-a026-9ae9a99bb175';
  const scheduleId = '066be3d2-6a40-4f72-a8af-61fb3452e4b1' as UUID;

  const schedule: Schedule = {
    scheduleId,
    dayOfWeek: DayOfWeek.MONDAY,
    startTime: '09:00',
    endTime: '17:00',
    slotDuration: 30,
    breaks: [{ start: '13:00', end: '14:00' }],
  };

  beforeEach(async () => {
    bookingsRepository = createRepositoryMock<Booking>();
    schedulesRepository = createRepositoryMock<Schedule>();
    usersRepository = createRepositoryMock<User>();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BookingsService,
        {
          provide: getRepositoryToken(Booking),
          useValue: bookingsRepository,
        },
        {
          provide: getRepositoryToken(Schedule),
          useValue: schedulesRepository,
        },
        {
          provide: getRepositoryToken(User),
          useValue: usersRepository,
        },
      ],
    }).compile();

    service = module.get<BookingsService>(BookingsService);
  });

  it('creates a booking when the requested slot is inside the doctor schedule', async () => {
    usersRepository.findOne
      ?.mockResolvedValueOnce({ userId: patientId, roles: [Role.PATIENT] })
      .mockResolvedValueOnce({ userId: doctorId, roles: [Role.DOCTOR] });
    schedulesRepository.findOne?.mockResolvedValue(schedule);
    bookingsRepository.findOne?.mockResolvedValue(null);

    const booking = await service.create(patientId, {
      doctorId,
      appointmentDate: '2026-05-25',
      startTime: '09:30',
    });

    expect(booking).toEqual({
      doctor: { userId: doctorId },
      patient: { userId: patientId },
      schedule: { scheduleId },
      appointmentDate: '2026-05-25',
      startTime: '09:30',
      endTime: '10:00',
      status: BookingStatus.BOOKED,
    });
    expect(bookingsRepository.save).toHaveBeenCalledWith(booking);
  });

  it('throws when the patient does not exist', async () => {
    usersRepository.findOne?.mockResolvedValue(null);

    await expect(
      service.create(patientId, {
        doctorId,
        appointmentDate: '2026-05-25',
        startTime: '09:30',
      }),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('throws when the doctor does not exist', async () => {
    usersRepository.findOne
      ?.mockResolvedValueOnce({ userId: patientId, roles: [Role.PATIENT] })
      .mockResolvedValueOnce(null);

    await expect(
      service.create(patientId, {
        doctorId,
        appointmentDate: '2026-05-25',
        startTime: '09:30',
      }),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('throws when a patient tries to book themselves', async () => {
    usersRepository.findOne
      ?.mockResolvedValueOnce({ userId: patientId, roles: [Role.PATIENT] })
      .mockResolvedValueOnce({ userId: patientId, roles: [Role.DOCTOR] });

    await expect(
      service.create(patientId, {
        doctorId: patientId,
        appointmentDate: '2026-05-25',
        startTime: '09:30',
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('throws when the doctor has no schedule for the appointment day', async () => {
    usersRepository.findOne
      ?.mockResolvedValueOnce({ userId: patientId, roles: [Role.PATIENT] })
      .mockResolvedValueOnce({ userId: doctorId, roles: [Role.DOCTOR] });
    schedulesRepository.findOne?.mockResolvedValue(null);

    await expect(
      service.create(patientId, {
        doctorId,
        appointmentDate: '2026-05-26',
        startTime: '09:30',
      }),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('throws when appointmentDate is not a real calendar date', async () => {
    usersRepository.findOne
      ?.mockResolvedValueOnce({ userId: patientId, roles: [Role.PATIENT] })
      .mockResolvedValueOnce({ userId: doctorId, roles: [Role.DOCTOR] });

    await expect(
      service.create(patientId, {
        doctorId,
        appointmentDate: '2026-02-31',
        startTime: '09:30',
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('throws when the requested slot is outside schedule hours', async () => {
    usersRepository.findOne
      ?.mockResolvedValueOnce({ userId: patientId, roles: [Role.PATIENT] })
      .mockResolvedValueOnce({ userId: doctorId, roles: [Role.DOCTOR] });
    schedulesRepository.findOne?.mockResolvedValue(schedule);

    await expect(
      service.create(patientId, {
        doctorId,
        appointmentDate: '2026-05-25',
        startTime: '17:00',
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('throws when the requested slot overlaps a break', async () => {
    usersRepository.findOne
      ?.mockResolvedValueOnce({ userId: patientId, roles: [Role.PATIENT] })
      .mockResolvedValueOnce({ userId: doctorId, roles: [Role.DOCTOR] });
    schedulesRepository.findOne?.mockResolvedValue(schedule);

    await expect(
      service.create(patientId, {
        doctorId,
        appointmentDate: '2026-05-25',
        startTime: '13:00',
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('throws when the requested slot does not align with slot duration', async () => {
    usersRepository.findOne
      ?.mockResolvedValueOnce({ userId: patientId, roles: [Role.PATIENT] })
      .mockResolvedValueOnce({ userId: doctorId, roles: [Role.DOCTOR] });
    schedulesRepository.findOne?.mockResolvedValue(schedule);

    await expect(
      service.create(patientId, {
        doctorId,
        appointmentDate: '2026-05-25',
        startTime: '09:15',
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('throws when the requested slot is already booked', async () => {
    usersRepository.findOne
      ?.mockResolvedValueOnce({ userId: patientId, roles: [Role.PATIENT] })
      .mockResolvedValueOnce({ userId: doctorId, roles: [Role.DOCTOR] });
    schedulesRepository.findOne?.mockResolvedValue(schedule);
    bookingsRepository.findOne?.mockResolvedValue({ bookingId: 'booking-id' });

    await expect(
      service.create(patientId, {
        doctorId,
        appointmentDate: '2026-05-25',
        startTime: '09:30',
      }),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('returns patient bookings ordered by date and time', async () => {
    const bookings = [{ bookingId: 'booking-id' as UUID }];
    usersRepository.findOne?.mockResolvedValue({
      userId: patientId,
      roles: [Role.PATIENT],
    });
    bookingsRepository.find?.mockResolvedValue(bookings);

    await expect(service.findPatientBookings(patientId)).resolves.toBe(
      bookings,
    );
    expect(bookingsRepository.find).toHaveBeenCalledWith({
      where: { patient: { userId: patientId } },
      relations: { doctor: true, schedule: true },
      order: { appointmentDate: 'ASC', startTime: 'ASC' },
    });
  });

  it('cancels a patient booking', async () => {
    const booking = {
      bookingId: '9f035bdf-6b2f-4e95-b760-d1593cb0c855' as UUID,
      status: BookingStatus.BOOKED,
    };
    bookingsRepository.findOne?.mockResolvedValue(booking);

    await expect(
      service.cancel(patientId, booking.bookingId as string),
    ).resolves.toEqual({ cancelled: true });

    expect(bookingsRepository.save).toHaveBeenCalledWith({
      ...booking,
      status: BookingStatus.CANCELLED,
    });
  });

  it('returns success without saving when booking is already cancelled', async () => {
    const booking = {
      bookingId: '9f035bdf-6b2f-4e95-b760-d1593cb0c855' as UUID,
      status: BookingStatus.CANCELLED,
    };
    bookingsRepository.findOne?.mockResolvedValue(booking);

    await expect(
      service.cancel(patientId, booking.bookingId as string),
    ).resolves.toEqual({ cancelled: true });

    expect(bookingsRepository.save).not.toHaveBeenCalled();
  });

  it('throws when cancelling a booking that does not belong to the patient', async () => {
    bookingsRepository.findOne?.mockResolvedValue(null);

    await expect(
      service.cancel(patientId, '9f035bdf-6b2f-4e95-b760-d1593cb0c855'),
    ).rejects.toBeInstanceOf(NotFoundException);
  });
});
