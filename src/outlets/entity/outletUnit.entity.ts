import { Exclude } from 'class-transformer';
import type { UUID } from 'crypto';
import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Outlet } from './outlet.entity';
import { CommonStatus } from 'src/utils/enum/commonStatus.enum';
import { BookingStatus } from 'src/utils/enum/bookingStatus.enum';

@Entity()
export class OutletUnit {
  @PrimaryGeneratedColumn()
  @Exclude()
  id?: number;

  @Index()
  @PrimaryGeneratedColumn('uuid')
  unitId?: UUID;

  @Index()
  @Column({ type: 'int', nullable: false })
  number?: number;

  @Column({ type: 'int', default: CommonStatus.ACTIVE })
  status?: CommonStatus;

  @Column({ type: 'int', default: BookingStatus.AVAILABLE })
  bookingStatus?: BookingStatus;

  @ManyToOne(() => Outlet, (outlet) => outlet.units, {
    onDelete: 'CASCADE',
  })
  outlet?: Outlet;

  @Column({ type: 'uuid', nullable: true })
  createdBy?: UUID;

  @Column({ type: 'uuid', nullable: true })
  updatedBy?: UUID;

  @CreateDateColumn()
  createdAt?: Date;

  @UpdateDateColumn()
  updatedAt?: Date;
}
