import { ConflictException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule, getRepositoryToken } from '@nestjs/typeorm';
import type { UUID } from 'crypto';
import { DayOfWeek } from 'src/schedules/enum/dayOfWeek.enum';
import { Schedule } from 'src/schedules/entity/schedule.entity';
import { User } from 'src/users/entity/user.entity';
import { Role } from 'src/utils/enum/role.enum';
import { DataSource, Repository } from 'typeorm';
import { BookingsService } from './bookings.service';
import { Booking } from './entity/booking.entity';
import { BookingStatus } from './enum/booking-status.enum';
import { RedisLockService } from './redis-lock.service';
import { StripePaymentsService } from './stripe-payments.service';

describe('BookingsService integration', () => {
  let module: TestingModule;
  let dataSource: DataSource;
  let service: BookingsService;
  let usersRepository: Repository<User>;
  let schedulesRepository: Repository<Schedule>;
  let bookingsRepository: Repository<Booking>;

  let patientId: string;
  let doctorId: string;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          type: 'postgres',
          host: process.env.TEST_DB_HOST ?? '127.0.0.1',
          port: Number(process.env.TEST_DB_PORT ?? 5433),
          username: process.env.TEST_DB_USERNAME ?? 'postgres',
          password: process.env.TEST_DB_PASSWORD ?? 'postgres',
          database: process.env.TEST_DB_NAME ?? 'system_design_test',
          entities: [Booking, Schedule, User],
          synchronize: true,
          dropSchema: true,
          retryAttempts: 1,
          retryDelay: 100,
        }),
        TypeOrmModule.forFeature([Booking, Schedule, User]),
      ],
      providers: [
        BookingsService,
        RedisLockService,
        {
          provide: StripePaymentsService,
          useValue: {
            getBookingPaymentAmount: jest.fn(() => 5000),
            getBookingPaymentCurrency: jest.fn(() => 'usd'),
            createPaymentIntent: jest.fn(({ bookingId }) =>
              Promise.resolve({
                id: `pi_${bookingId}`,
                client_secret: `secret_${bookingId}`,
                status: 'requires_payment_method',
              }),
            ),
          },
        },
      ],
    }).compile();

    dataSource = module.get(DataSource);
    service = module.get(BookingsService);
    usersRepository = module.get(getRepositoryToken(User));
    schedulesRepository = module.get(getRepositoryToken(Schedule));
    bookingsRepository = module.get(getRepositoryToken(Booking));
  });

  beforeEach(async () => {
    await dataSource.query(
      'TRUNCATE TABLE "booking", "schedule", "user" RESTART IDENTITY CASCADE',
    );

    const patient = await usersRepository.save(
      usersRepository.create({
        firstName: 'Test',
        lastName: 'Patient',
        roles: [Role.PATIENT],
        emailAddress: 'patient.integration@example.com',
        countryCode: '+1',
        mobilePhone: '5551000001',
        password: 'password',
      }),
    );
    const doctor = await usersRepository.save(
      usersRepository.create({
        firstName: 'Test',
        lastName: 'Doctor',
        roles: [Role.DOCTOR],
        emailAddress: 'doctor.integration@example.com',
        countryCode: '+1',
        mobilePhone: '5551000002',
        password: 'password',
      }),
    );

    patientId = patient.userId as string;
    doctorId = doctor.userId as string;

    await schedulesRepository.save(
      schedulesRepository.create({
        doctor: { userId: doctorId as UUID },
        dayOfWeek: DayOfWeek.MONDAY,
        startTime: '09:00',
        endTime: '17:00',
        slotDuration: 30,
        breaks: [{ start: '13:00', end: '14:00' }],
      }),
    );
  });

  afterAll(async () => {
    if (dataSource?.isInitialized) {
      await dataSource.destroy();
    }
    await module?.close();
  });

  it('creates a booking', async () => {
    const result = await service.create(patientId, {
      doctorId,
      appointmentDate: '2026-05-25',
      startTime: '09:30',
    });

    const booking = result.booking;

    expect(booking.bookingId).toBeDefined();
    expect(booking.appointmentDate).toBe('2026-05-25');
    expect(booking.startTime).toBe('09:30');
    expect(booking.endTime).toBe('10:00');
    expect(booking.status).toBe(BookingStatus.PENDING_PAYMENT);
    expect(result.payment.clientSecret).toBe(`secret_${booking.bookingId}`);
  });

  it('throws conflict for a duplicate booking', async () => {
    const dto = {
      doctorId,
      appointmentDate: '2026-05-25',
      startTime: '09:30',
    };

    await service.create(patientId, dto);

    await expect(service.create(patientId, dto)).rejects.toBeInstanceOf(
      ConflictException,
    );
  });

  it('allows only one booking when many patients request the same slot', async () => {
    const patients = await usersRepository.save(
      Array.from({ length: 50 }, (_, index) =>
        usersRepository.create({
          firstName: 'Concurrent',
          lastName: `Patient ${index}`,
          roles: [Role.PATIENT],
          emailAddress: `patient-${index}.integration@example.com`,
          countryCode: '+1',
          mobilePhone: `555200${index.toString().padStart(4, '0')}`,
          password: 'password',
        }),
      ),
    );

    const bookingAttempts = await Promise.allSettled(
      patients.map((patient) =>
        service.create(patient.userId as string, {
          doctorId,
          appointmentDate: '2026-05-25',
          startTime: '09:30',
        }),
      ),
    );

    expect(
      bookingAttempts.filter((result) => result.status === 'fulfilled'),
    ).toHaveLength(1);
    expect(await bookingsRepository.count()).toBe(1);
  });

  it('cancels a booking', async () => {
    const result = await service.create(patientId, {
      doctorId,
      appointmentDate: '2026-05-25',
      startTime: '09:30',
    });
    const booking = result.booking;

    await expect(
      service.cancel(patientId, booking.bookingId as string),
    ).resolves.toEqual({ cancelled: true });

    const cancelledBooking = await bookingsRepository.findOneByOrFail({
      bookingId: booking.bookingId,
    });
    expect(cancelledBooking.status).toBe(BookingStatus.CANCELLED);
  });
});
