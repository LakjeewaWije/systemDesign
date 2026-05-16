import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import type { UUID } from 'crypto';
import { User } from 'src/users/entity/user.entity';
import { Role } from 'src/utils/enum/role.enum';
import { ILike, Not, Repository } from 'typeorm';
import { CreateScheduleDto } from './dto/create-schedule.dto';
import { UpdateScheduleDto } from './dto/update-schedule.dto';
import { Schedule } from './entity/schedule.entity';

@Injectable()
export class SchedulesService {
  constructor(
    @InjectRepository(Schedule)
    private schedulesRepository: Repository<Schedule>,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async create(
    doctorId: string,
    createScheduleDto: CreateScheduleDto,
  ): Promise<Schedule> {
    await this.validateDoctor(doctorId);
    this.validateScheduleTime(createScheduleDto);

    const existingSchedule = await this.schedulesRepository.findOne({
      where: {
        doctor: { userId: doctorId as UUID },
        dayOfWeek: createScheduleDto.dayOfWeek,
      },
    });

    if (existingSchedule) {
      throw new ConflictException(
        `Schedule already exists for this doctor on ${createScheduleDto.dayOfWeek}`,
      );
    }

    const scheduleCount = await this.schedulesRepository.count({
      where: { doctor: { userId: doctorId as UUID } },
    });

    if (scheduleCount >= 7) {
      throw new BadRequestException('Doctor can only have 7 weekly schedules');
    }

    const schedule = this.schedulesRepository.create({
      ...createScheduleDto,
      doctor: { userId: doctorId as UUID },
      breaks: createScheduleDto.breaks ?? [],
    });

    return await this.schedulesRepository.save(schedule);
  }

  async findAll(doctorId: string): Promise<Schedule[]> {
    await this.validateDoctor(doctorId);

    return await this.schedulesRepository.find({
      where: { doctor: { userId: doctorId as UUID } },
      order: { dayOfWeek: 'ASC' },
    });
  }

  async findOne(doctorId: string, scheduleId: string): Promise<Schedule> {
    const schedule = await this.schedulesRepository.findOne({
      where: {
        scheduleId: scheduleId as UUID,
        doctor: { userId: doctorId as UUID },
      },
      relations: { doctor: true },
    });

    if (!schedule) {
      throw new NotFoundException(`Schedule with id ${scheduleId} not found`);
    }

    return schedule;
  }

  async update(
    doctorId: string,
    scheduleId: string,
    updateScheduleDto: UpdateScheduleDto,
  ): Promise<Schedule> {
    const schedule = await this.findOne(doctorId, scheduleId);
    const nextDayOfWeek = updateScheduleDto.dayOfWeek ?? schedule.dayOfWeek;

    this.validateScheduleTime({ ...schedule, ...updateScheduleDto });

    if (updateScheduleDto.dayOfWeek) {
      const existingSchedule = await this.schedulesRepository.findOne({
        where: {
          doctor: { userId: doctorId as UUID },
          dayOfWeek: nextDayOfWeek,
          scheduleId: Not(scheduleId as UUID),
        },
      });

      if (existingSchedule) {
        throw new ConflictException(
          `Schedule already exists for this doctor on ${nextDayOfWeek}`,
        );
      }
    }

    Object.assign(schedule, updateScheduleDto, {
      doctor: { userId: doctorId as UUID },
      breaks: updateScheduleDto.breaks ?? schedule.breaks ?? [],
    });

    await this.schedulesRepository.save(schedule);

    return await this.findOne(doctorId, scheduleId);
  }

  async remove(
    doctorId: string,
    scheduleId: string,
  ): Promise<{ deleted: boolean }> {
    await this.findOne(doctorId, scheduleId);
    await this.schedulesRepository.delete({ scheduleId: scheduleId as UUID });

    return { deleted: true };
  }

  private async validateDoctor(doctorId: string): Promise<void> {
    const doctor = await this.usersRepository.findOne({
      where: {
        userId: doctorId as UUID,
        roles: ILike(`%${Role.DOCTOR}%`),
      },
    });

    if (!doctor) {
      throw new NotFoundException(`Doctor with id ${doctorId} not found`);
    }
  }

  private validateScheduleTime(
    schedule: Partial<
      Pick<Schedule, 'startTime' | 'endTime' | 'slotDuration'>
    > & {
      breaks?: { start?: string; end?: string }[];
    },
  ): void {
    if (!schedule.startTime || !schedule.endTime || !schedule.slotDuration) {
      throw new BadRequestException(
        'startTime, endTime and slotDuration are required',
      );
    }

    const startMinutes = this.toMinutes(schedule.startTime);
    const endMinutes = this.toMinutes(schedule.endTime);

    if (startMinutes >= endMinutes) {
      throw new BadRequestException('startTime must be before endTime');
    }

    const scheduleMinutes = endMinutes - startMinutes;
    if (schedule.slotDuration > scheduleMinutes) {
      throw new BadRequestException(
        'slotDuration cannot be longer than the schedule time range',
      );
    }

    for (const scheduleBreak of schedule.breaks ?? []) {
      if (!scheduleBreak.start || !scheduleBreak.end) {
        throw new BadRequestException('Break start and end are required');
      }

      const breakStart = this.toMinutes(scheduleBreak.start);
      const breakEnd = this.toMinutes(scheduleBreak.end);

      if (breakStart >= breakEnd) {
        throw new BadRequestException('Break start must be before break end');
      }

      if (breakStart < startMinutes || breakEnd > endMinutes) {
        throw new BadRequestException(
          'Breaks must be inside the schedule time range',
        );
      }
    }
  }

  private toMinutes(time: string): number {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  }
}
