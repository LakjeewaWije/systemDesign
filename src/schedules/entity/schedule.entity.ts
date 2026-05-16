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
import { User } from 'src/users/entity/user.entity';
import { DayOfWeek } from '../enum/dayOfWeek.enum';

@Entity()
@Index(['doctor', 'dayOfWeek'], { unique: true })
export class Schedule {
  @PrimaryGeneratedColumn()
  @Exclude()
  id?: number;

  @Column({ type: 'uuid', unique: true })
  @Generated('uuid')
  scheduleId?: UUID;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'doctorId', referencedColumnName: 'userId' })
  doctor?: User;

  @Column({ type: 'enum', enum: DayOfWeek })
  dayOfWeek?: DayOfWeek;

  @Column({ type: 'time' })
  startTime?: string;

  @Column({ type: 'time' })
  endTime?: string;

  @Column({ type: 'int' })
  slotDuration?: number;

  @Column({ type: 'jsonb', default: () => "'[]'" })
  breaks?: { start: string; end: string }[];

  @CreateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  createdAt?: Date;

  @UpdateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  updatedAt?: Date;
}
