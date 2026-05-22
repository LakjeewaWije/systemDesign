import { Test, TestingModule } from '@nestjs/testing';
import type { Request } from 'express';
import { AuthGuard } from 'src/auth/auth.guard';
import { RolesGuard } from 'src/utils/roles.guard';
import { BookingsController } from './bookings.controller';
import { BookingsService } from './bookings.service';
import { CreateBookingDto } from './dto/create-booking.dto';

describe('BookingsController', () => {
  let controller: BookingsController;
  let bookingsService: {
    create: jest.Mock;
    findPatientBookings: jest.Mock;
    cancel: jest.Mock;
  };

  const patientId = '6cd35374-e0a4-4d8d-8e84-c32a9c0af287';
  const bookingId = '9f035bdf-6b2f-4e95-b760-d1593cb0c855';

  const request = {
    user: { userId: patientId },
  } as unknown as Request;

  beforeEach(async () => {
    bookingsService = {
      create: jest.fn(),
      findPatientBookings: jest.fn(),
      cancel: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [BookingsController],
      providers: [
        {
          provide: BookingsService,
          useValue: bookingsService,
        },
      ],
    })
      .overrideGuard(AuthGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .compile();

    controller = module.get<BookingsController>(BookingsController);
  });

  it('creates a booking for the authenticated patient', async () => {
    const dto: CreateBookingDto = {
      doctorId: '5783bd24-56ba-42fc-a026-9ae9a99bb175',
      appointmentDate: '2026-05-25',
      startTime: '09:30',
    };
    const booking = { bookingId };
    bookingsService.create.mockResolvedValue(booking);

    await expect(controller.create(dto, request)).resolves.toBe(booking);
    expect(bookingsService.create).toHaveBeenCalledWith(patientId, dto);
  });

  it('returns bookings for the authenticated patient', async () => {
    const bookings = [{ bookingId }];
    bookingsService.findPatientBookings.mockResolvedValue(bookings);

    await expect(controller.findPatientBookings(request)).resolves.toBe(
      bookings,
    );
    expect(bookingsService.findPatientBookings).toHaveBeenCalledWith(patientId);
  });

  it('cancels a booking for the authenticated patient', async () => {
    const result = { cancelled: true };
    bookingsService.cancel.mockResolvedValue(result);

    await expect(controller.cancel(bookingId, request)).resolves.toBe(result);
    expect(bookingsService.cancel).toHaveBeenCalledWith(patientId, bookingId);
  });
});
