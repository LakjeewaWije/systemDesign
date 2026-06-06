import { Exclude } from 'class-transformer';
import type { UUID } from 'crypto';
import {
  Column,
  CreateDateColumn,
  Entity,
  Generated,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Schedule } from 'src/schedules/entity/schedule.entity';
import { User } from 'src/users/entity/user.entity';
import { BookingStatus } from '../enum/booking-status.enum';

@Entity()
@Index(['doctor', 'appointmentDate', 'startTime'])
@Index(['patient', 'appointmentDate'])
export class Booking {
  @PrimaryGeneratedColumn()
  @Exclude()
  id?: number;

  @Column({ type: 'uuid', unique: true })
  @Generated('uuid')
  bookingId?: UUID;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'doctorId', referencedColumnName: 'userId' })
  doctor?: User;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'patientId', referencedColumnName: 'userId' })
  patient?: User;

  @ManyToOne(() => Schedule, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'scheduleId', referencedColumnName: 'scheduleId' })
  schedule?: Schedule;

  @Column({ type: 'date' })
  appointmentDate?: string;

  @Column({ type: 'time' })
  startTime?: string;

  @Column({ type: 'time' })
  endTime?: string;

  @Column({
    type: 'enum',
    enum: BookingStatus,
    default: BookingStatus.PENDING_PAYMENT,
  })
  status?: BookingStatus;

  @Column({ type: 'varchar', nullable: true })
  paymentIntentId?: string | null;

  @Column({ type: 'varchar', nullable: true })
  paymentClientSecret?: string | null;

  @Column({ type: 'varchar', nullable: true })
  paymentIdempotencyKey?: string | null;

  @Column({ type: 'int', nullable: true })
  paymentAmount?: number | null;

  @Column({ type: 'varchar', length: 3, nullable: true })
  paymentCurrency?: string | null;

  @CreateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  createdAt?: Date;

  @UpdateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  updatedAt?: Date;
}
